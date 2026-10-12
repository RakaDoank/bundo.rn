export type PlistValue =
	| boolean
	| string
	| string[]
	| DictionaryValue
	| DictionaryValue[]

type DictionaryValue = {
	[Key in string]:
		| boolean
		| string
		| string[]
		| DictionaryValue
		// | {
		// 	[Key2 in string]: DictionaryValue
		// }[]
}
