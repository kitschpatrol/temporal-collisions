import { type Handler } from '@netlify/functions'
import { getTemporalCollisions } from '../../src/main'

// eslint-disable-next-line @typescript-eslint/naming-convention
const handler: Handler = async (event) => {
	const response: Record<string, unknown> = {}

	try {
		// Netlify Functions timeout after 10 seconds
		const collisions = await getTemporalCollisions(
			event.queryStringParameters as Record<string, unknown>,
		)
		response.status = 'success'
		response.results = collisions
	} catch (error) {
		response.status = 'error'
		response.reason = error instanceof Error ? error.message : 'Unknown error'
	}

	return {
		body: JSON.stringify(response),
		headers: {
			'access-control-allow-origin': 'https://frontiernerds.com',
			'Content-Type': 'application/json; charset=utf-8',
			// "access-control-allow-origin": "*",
		},
		statusCode: 200,
	}
}

export { handler }
