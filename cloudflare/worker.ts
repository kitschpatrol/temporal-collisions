import { getTemporalCollisions } from '../src/index'

// Cap caller-controlled search time so a request can't hold the connection
// open indefinitely — Cloudflare Workers has no wall-clock limit.
const maxSearchTimeSecondsLimit = 60

/**
 * Parses an optional numeric query parameter, throwing on malformed values.
 */
function parseNumberParameter(parameters: URLSearchParams, name: string): number | undefined {
	const value = parameters.get(name)
	if (value === null) {
		return undefined
	}

	const parsed = Number(value)
	if (!Number.isFinite(parsed)) {
		throw new TypeError(`Invalid value "${value}" for "${name}", expected a number`)
	}

	return parsed
}

/**
 * Parses an optional date query parameter, throwing on malformed values.
 */
function parseDateParameter(parameters: URLSearchParams, name: string): Date | undefined {
	const value = parameters.get(name)
	if (value === null) {
		return undefined
	}

	const parsed = new Date(value)
	if (Number.isNaN(parsed.getTime())) {
		throw new TypeError(`Invalid value "${value}" for "${name}", expected a parsable date`)
	}

	return parsed
}

/**
 * Cloudflare Worker serving the collision search API. It runs on the
 * `frontiernerds.com/api/temporal-collisions*` route; requests to any other
 * path under that route pass through to the origin so other handlers can
 * respond.
 */
export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url)

		if (url.pathname !== '/api/temporal-collisions') {
			return fetch(request)
		}

		const response: Record<string, unknown> = {}

		try {
			const parameters = url.searchParams
			const maxSearchTimeSeconds = parseNumberParameter(parameters, 'maxSearchTimeSeconds')

			response.results = await getTemporalCollisions({
				maxDistanceSeconds: parseNumberParameter(parameters, 'maxDistanceSeconds'),
				maxSearchTimeSeconds:
					maxSearchTimeSeconds === undefined
						? undefined
						: Math.min(maxSearchTimeSeconds, maxSearchTimeSecondsLimit),
				minImageHeight: parseNumberParameter(parameters, 'minImageHeight'),
				minImageWidth: parseNumberParameter(parameters, 'minImageWidth'),
				targetTime: parseDateParameter(parameters, 'targetTime'),
			})
			response.status = 'success'
		} catch (error) {
			response.status = 'error'
			response.reason = error instanceof Error ? error.message : 'Unknown error'
		}

		return Response.json(response, {
			headers: {
				'access-control-allow-origin': '*',
				'content-type': 'application/json; charset=utf-8',
			},
		})
	},
}
