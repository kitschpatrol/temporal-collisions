import { expect, it } from 'vitest'
import { getTemporalCollisions } from '../src/main'

it(
	'gets recent collisions',
	{
		timeout: 60_000,
	},
	async () => {
		const result = await getTemporalCollisions({ minImageHeight: 278, minImageWidth: 278 })
		console.log(result)
		expect(result).not.toBe('')
	},
)
