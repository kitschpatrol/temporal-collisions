import { existsSync } from 'node:fs'
import { defineConfig } from 'vitest/config'

// Tests hit the real Flickr API and need FLICKR_API_KEY. In production the
// Workers runtime populates process.env from secrets, and `wrangler dev` loads
// .env itself, so this is the only place that needs manual loading.
if (existsSync('.env')) {
	process.loadEnvFile('.env')
}

export default defineConfig({
	test: {
		include: ['test/**/*.test.ts'],
	},
})
