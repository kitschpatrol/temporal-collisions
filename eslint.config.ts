import { eslintConfig } from '@kitschpatrol/eslint-config'

export default eslintConfig({
	ignores: ['/archive/**/*'],
	ts: {
		overrides: {
			'depend/ban-dependencies': [
				'error',
				{
					allowed: ['dotenv'],
				},
			],
		},
	},
})
