export interface PodSpecSourceFromCocoapods {
	operator?:
		| ">"
		| ">="
		| "<"
		| "<="
		| "~>",
	value: string,
}
