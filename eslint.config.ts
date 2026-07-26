import { eslintConfig } from '@kitschpatrol/eslint-config'

export default eslintConfig(
	{
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
	},
	{
		files: ['readme.md/*.ts'],
		rules: {
			'import/no-unresolved': 'off',
		},
	},
)
