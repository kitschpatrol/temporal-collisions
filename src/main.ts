/* eslint-disable jsdoc/require-jsdoc */

import 'dotenv/config'
import { createFlickr } from 'flickr-sdk'
import { performance } from 'node:perf_hooks'
// Import util from "util";

// Kind of a hard-coded duplication from the "extras" object in the Flickr photo search query
const suffixes = ['t', 'm', 'z', 'c', 'l', 'o']

function minSizeImageUrl(photo: Record<string, unknown>, minWidth: number, minHeight: number) {
	// Get the url that is at least as wide as the min width...
	let currentWidth = Number.MAX_SAFE_INTEGER
	let currentHeight = Number.MAX_SAFE_INTEGER
	let url = ''

	for (const suffix of suffixes) {
		if (!Object.hasOwn(photo, 'url_' + suffix)) {
			continue
		}

		const width = photo['width_' + suffix] as number
		const height = photo['height_' + suffix] as number

		if (
			width >= minWidth &&
			width < currentWidth &&
			height >= minHeight &&
			height < currentHeight
		) {
			currentWidth = width
			currentHeight = height
			url = photo['url_' + suffix] as string
		}
	}

	// Backup if we didn't find anything...
	if (url === '') {
		return biggestImageUrl(photo)
	}

	return url
}

function biggestImageUrl(photo: Record<string, unknown>): string {
	// Not a lot of guarantees with flickr image availability...
	// grab the biggest one we can find
	let maxArea = 0
	let url = ''

	for (const suffix of suffixes) {
		if (!Object.hasOwn(photo, 'url_' + suffix)) {
			continue
		}

		const area = (photo['width_' + suffix] as number) * (photo['height_' + suffix] as number)

		if (area > maxArea) {
			maxArea = area
			url = photo['url_' + suffix] as string
		}
	}

	return url
}

function dateTakenIsReal(photo: Record<string, unknown>): boolean {
	// If flickr doesn't know date taken, it can default to date upload
	// to throw out that bogus data, we make sure they don't match
	// purely matching time might not be great given different time zones...
	// count on seconds and minutes not being identical and ignore hour

	// Create js date objects to compare
	const dateUploaded = new Date((photo.dateupload as number) * 1000) // UNIX timestamp... time zone where uploaded?
	const dateTaken = new Date(Date.parse(photo.datetaken as string)) // SQL timestamp... time zone where taken?
	// const diffSeconds = Math.abs(dateUploaded.getTime() - dateTaken.getTime()) / 1000;

	return (
		dateUploaded.getMinutes() !== dateTaken.getMinutes() ||
		dateUploaded.getSeconds() !== dateTaken.getSeconds()
	)
}

function ownerIsUnique(owner: string, photos: Array<Record<string, unknown>>): boolean {
	return photos.every((photo) => photo.owner !== owner)
}

type Photo = {
	datetaken: string
	datetakengranularity: number
	datetakenunknown: string
	id: string
	owner: string
	tags: string
	title: string
}

type PhotoResult = {
	id: string
	imgUrl: string
	pageUrl: string
	title: string
}

/**
 * Rounds a timestamp to the nearest interval based on maxDistanceSeconds
 *
 * @param dateTaken - SQL timestamp string (e.g., "2023-11-05 14:30:25")
 * @param maxDistanceSeconds - Number of seconds to round to (0 means exact
 *   match)
 *
 * @returns A string key representing the rounded time bucket
 */
function getRoundedTimeKey(dateTaken: string, maxDistanceSeconds: number): string {
	if (maxDistanceSeconds === 0) {
		return dateTaken
	}

	// Parse the date string and get timestamp in seconds
	const dateMs = Date.parse(dateTaken)
	const dateSeconds = Math.floor(dateMs / 1000)

	// Round down to the nearest interval
	const roundedSeconds = Math.floor(dateSeconds / maxDistanceSeconds) * maxDistanceSeconds

	// Return a string key (using the rounded timestamp)
	return roundedSeconds.toString()
}

export async function getTemporalCollisions({
	maxDistanceSeconds = 3,
	maxSearchTimeSeconds = 15,
	minImageHeight = Number.MAX_SAFE_INTEGER,
	minImageWidth = Number.MAX_SAFE_INTEGER,
	targetTime = new Date(),
}: {
	maxDistanceSeconds?: number
	maxSearchTimeSeconds?: number
	minImageHeight?: number
	minImageWidth?: number
	targetTime?: Date
} = {}): Promise<Record<string, unknown>> {
	const flickrApiKey = process.env.FLICKR_API_KEY
	if (flickrApiKey === undefined) {
		throw new Error('Missing FLICKR_API_KEY')
	}

	const { flickr } = createFlickr(flickrApiKey)

	// Key: Date Taken
	// Value: Array of image objects
	const images = new Map<string, Photo[]>()

	// Get list of recent images

	// UNIX timestamp
	const nowIsh = Math.round(targetTime.getTime() / 1000) - 60 * 60 * 12 // Look between 12 hours ago
	const aWhileAgo = nowIsh - 60 * 60 * 24 * 5 // And up to five days ago...

	let timeElapsedSeconds = 0
	const searchStartTime = performance.now()

	let currentPage = 1
	let totalPages = Number.MAX_SAFE_INTEGER // Will be overwritten by actual number of pages

	while (timeElapsedSeconds < maxSearchTimeSeconds && currentPage < totalPages) {
		// Console.log("Loading page: " + currentPage + " / " + totalPages);

		const response = (await flickr('flickr.photos.search', {
			extras: 'date_taken, date_upload, url_t, url_m, url_z, url_c, url_l, url_o',
			// eslint-disable-next-line ts/naming-convention
			max_taken_date: String(nowIsh),
			// eslint-disable-next-line ts/naming-convention
			min_taken_date: String(aWhileAgo),
			page: String(currentPage),
			// eslint-disable-next-line ts/naming-convention
			per_page: '500',
			sort: 'date-taken-desc',
		})) as {
			// TODO real types...
			photos: {
				pages: number
				photo: Photo[]
			}
		}

		totalPages = response.photos.pages
		currentPage += 1

		// Validation
		const validPhotos = response.photos.photo.filter(
			(photo) =>
				photo.datetakengranularity === 0 &&
				photo.datetakenunknown !== '1' &&
				dateTakenIsReal(photo),
		)

		for (const photo of validPhotos) {
			const timeKey = getRoundedTimeKey(photo.datetaken, maxDistanceSeconds)
			if (images.has(timeKey)) {
				// Make sure the owner is unique... collision groups can't share owners

				if (ownerIsUnique(photo.owner, images.get(timeKey)!)) {
					images.get(timeKey)!.push(photo)
				}
				//  Else {
				//   console.log(`Skipping ${photo["owner"]} they are already in the collection!`);
				// }
			} else {
				images.set(timeKey, [photo])
			}
		}

		timeElapsedSeconds = (performance.now() - searchStartTime) / 1000
	}

	// Console.log(`Found ${images.size} images in ${timeElapsedSeconds} seconds`);

	// Filter to only those images with collisions
	const collisionImages = new Map([...images].filter(([_, v]) => v.length > 2))

	// Sort by number of collisions descending (breaks time!)
	const sortedCollisionImages = new Map(
		// eslint-disable-next-line unicorn/no-array-sort
		[...collisionImages].sort((a, b) => b[1].length - a[1].length),
	)

	if (sortedCollisionImages.size > 0) {
		const result: {
			collisions: Array<{
				photos: PhotoResult[]
				time: Date
			}>
			imagesChecked: number
			timeMax: Date
			timeMin: Date
			timeRequested: Date
		} = {
			collisions: [],
			imagesChecked: images.size,
			timeMax: new Date(nowIsh * 1000),
			timeMin: new Date(aWhileAgo * 1000),
			timeRequested: new Date(nowIsh * 1000),
		}

		// Just provide a single collision for now... the one with the most matches
		const collision = sortedCollisionImages.values().next().value!

		const collisionResult: {
			photos: PhotoResult[]
			time: Date
		} = {
			photos: [],
			time: new Date(Date.parse(collision[0]!.datetaken)), // Grab time from first photo
		}

		// URL construction based on https://www.flickr.com/services/api/misc.urls.html
		for (const photo of collision) {
			const photoResult: PhotoResult = {
				id: photo.id,
				imgUrl: minSizeImageUrl(photo, minImageWidth, minImageHeight),
				pageUrl: `https://www.flickr.com/photos/${photo.owner}/${photo.id}`,
				title: photo.title,
			}

			collisionResult.photos.push(photoResult)
		}

		result.collisions.push(collisionResult)

		// Console.log(util.inspect(result, true, 10, true));

		return result
	}

	throw new Error('No collisions!')
}
