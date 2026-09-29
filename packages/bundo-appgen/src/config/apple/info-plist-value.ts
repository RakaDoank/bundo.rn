export type InfoPlistValue =
	| boolean
	| string
	| string[]
	| DictionaryValue

type DictionaryValue = {
	[Key in string]:
		| boolean
		| string
		| string[]
		| DictionaryValue
		| {
			[Key2 in string]: DictionaryValue
		}[]
}
