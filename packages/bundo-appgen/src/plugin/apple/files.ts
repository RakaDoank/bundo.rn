export interface Files {
	readonly Project: {
		["AppDelegate.swift"]: string,
		// add: (
		// 	filename: string,
		// 	source: string,
		// ) => void,
	},
	Podfile: string,
	// add: (
	// 	filename: string,
	// 	source: string,
	// ) => void,
}
