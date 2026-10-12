export interface PodDependencyFromGit {

	type: "git",

	/**
	 * The pod name or a name for specific subspec e.g. "QueryKit/Attribute".
	 */
	name: string,

	/**
	 * @example "https://github.com/facebook/react-native.git"
	 */
	url: string,

	revision?: {
		type:
			| "branch"
			| "tag"
			| "commit",
		ref: string,
	},

}
