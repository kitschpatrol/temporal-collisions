import { cspellConfig } from '@kitschpatrol/cspell-config'

export default cspellConfig({
	ignorePaths: ['archive/**/*', '**/changelog.md'],
	import: ['@kitschpatrol/cspell-config', '@kitschpatrol/dict-en-wiktionary/cspell-ext.json'],
	words: ['chagent'],
})
