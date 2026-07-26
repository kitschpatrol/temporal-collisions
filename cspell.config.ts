import { cspellConfig } from '@kitschpatrol/cspell-config'

export default cspellConfig({
	ignorePaths: ['archive/**/*'],
	import: ['@kitschpatrol/cspell-config', '@kitschpatrol/dict-en-wiktionary/cspell-ext.json'],
})
