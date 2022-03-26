import "dotenv/config";
import Flickr from "flickr-sdk";
//import util from "util";

// Kind of a hard-coded duplication from the "extras" object in the Flickr photo search query
const suffixes = ["t", "m", "z", "c", "l", "o"];

function minSizeImageUrl(photo: object, minWidth: number, minHeight: number) {
  // Get the url that is at least as wide as the min width...
  let currentWidth = Number.MAX_SAFE_INTEGER;
  let currentHeight = Number.MAX_SAFE_INTEGER;
  let url = "";

  suffixes.forEach((suffix) => {
    if (Object.prototype.hasOwnProperty.call(photo, "url_" + suffix)) {
      const width = photo["width_" + suffix];
      const height = photo["height_" + suffix];

      if (width >= minWidth && width < currentWidth && height >= minHeight && height < currentHeight) {
        currentWidth = width;
        currentHeight = height;
        url = photo["url_" + suffix];
      }
    }
  });

  // Backup if we didn't find anything...
  if (url == "") {
    return biggestImageUrl(photo);
  } else {
    return url;
  }
}

function biggestImageUrl(photo: object): string {
  // Not a lot of guarantees with flickr image availability...
  // grab the biggest one we can find
  let maxArea = 0;
  let url = "";

  suffixes.forEach((suffix) => {
    if (Object.prototype.hasOwnProperty.call(photo, "url_" + suffix)) {
      const area = photo["width_" + suffix] * photo["height_" + suffix];

      if (area > maxArea) {
        maxArea = area;
        url = photo["url_" + suffix];
      }
    }
  });

  return url;
}

function dateTakenIsReal(photo: object): boolean {
  // If flickr doesn't know date taken, it can default to date upload
  // to throw out that bogus data, we make sure they don't match
  // purely matching time might not be great given different time zones...
  // count on seconds and minutes not being identical and ignore hour

  // Create js date objects to compare
  const dateUploaded = new Date(photo["dateupload"] * 1000); // unix timestamp... time zone where uploaded?
  const dateTaken = new Date(Date.parse(photo["datetaken"])); // sql timestamp... time zone where taken?
  //const diffSeconds = Math.abs(dateUploaded.getTime() - dateTaken.getTime()) / 1000;

  return !(
    dateUploaded.getMinutes() === dateTaken.getMinutes() && dateUploaded.getSeconds() === dateTaken.getSeconds()
  );
}

function ownerIsUnique(owner: string, photos: Array<object>): boolean {
  return photos.every((photo) => photo["owner"] != owner);
}

export async function getTemporalCollisions({
  targetTime = new Date(),
  maxSearchTimeSeconds = 5,
  minImageWidth = Number.MAX_SAFE_INTEGER,
  minImageHeight = Number.MAX_SAFE_INTEGER,
}: {
  targetTime?: Date;
  maxSearchTimeSeconds?: number;
  minImageWidth?: number;
  minImageHeight?: number;
} = {}): Promise<object> {
  const flickrApiKey = process.env.FLICKR_API_KEY;
  const flickr = new Flickr(flickrApiKey);

  // Key: Date Taken
  // Value: Array of image objects
  const images = new Map<string, Array<object>>();

  // Get list of recent images

  // Unix timestamp
  const nowish = Math.round(targetTime.getTime() / 1000) - 60 * 60 * 12; // look between 12 hours ago
  const aWhileAgo = nowish - 60 * 60 * 24 * 5; // and up to five days ago...

  let timeElapsedSeconds = 0;
  const searchStartTime = performance.now();

  let currentPage = 1;
  let totalPages = Number.MAX_SAFE_INTEGER; // will be overwritten by actual number of pages

  while (timeElapsedSeconds < maxSearchTimeSeconds && currentPage < totalPages) {
    // console.log("Loading page: " + currentPage + " / " + totalPages);

    const response = await flickr.photos.search({
      page: currentPage,
      min_taken_date: aWhileAgo,
      max_taken_date: nowish,
      per_page: 500,
      extras: "date_taken, date_upload, url_t, url_m, url_z, url_c, url_l, url_o",
      sort: "date-taken-desc",
    });

    totalPages = response.body.photos.pages;
    currentPage += 1;

    response.body.photos.photo.forEach((photo: object) => {
      // Validation
      if (photo["datetakengranularity"] == 0 && photo["datetakenunknown"] !== "1" && dateTakenIsReal(photo)) {
        const dateTaken = photo["datetaken"];
        if (!images.has(dateTaken)) {
          images.set(dateTaken, [photo]);
        } else {
          // Make sure the owner is unique... collission groups can't share owners
          if (ownerIsUnique(photo["owner"], images.get(dateTaken))) {
            images.get(dateTaken).push(photo);
          }
          //  else {
          //   console.log(`Skipping ${photo["owner"]} they are already in the collection!`);
          // }
        }
      }
    });

    timeElapsedSeconds = (performance.now() - searchStartTime) / 1000;
  }

  // console.log(`Found ${images.size} images in ${timeElapsedSeconds} seconds`);

  // Filter to only those images with colissions
  const collisionImages = new Map([...images].filter(([k, v]) => v.length > 2));

  // Sort by number of collisions descending (breaks time!)
  const sortedCollisionImages = new Map(
    [...collisionImages.entries()].sort((a, b) => {
      return b[1].length - a[1].length;
    }),
  );

  if (sortedCollisionImages.size > 0) {
    const result = {
      timeRequested: new Date(nowish * 1000),
      timeMin: new Date(aWhileAgo * 1000),
      timeMax: new Date(nowish * 1000),
      imagesChecked: images.size,
      collisions: [],
    };

    // Just provide a single collision for now... the one with the most matches
    const collision = sortedCollisionImages.values().next().value;

    const collisionResult = {
      time: new Date(Date.parse(collision[0].datetaken)), // grab time from first photo
      photos: [],
    };

    // URL construction based on https://www.flickr.com/services/api/misc.urls.html
    collision.forEach((photo) => {
      const photoResult = {
        id: photo.id,
        title: photo.title,
        imgUrl: minSizeImageUrl(photo, minImageWidth, minImageHeight),
        pageUrl: `https://www.flickr.com/photos/${photo.owner}/${photo.id}`,
      };

      collisionResult.photos.push(photoResult);
    });

    result.collisions.push(collisionResult);

    // console.log(util.inspect(result, true, 10, true));

    return result;
  } else {
    throw new Error("No collisions!");
  }
}
