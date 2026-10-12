export interface PodDependencyFromCocoapods {

	type: "cocoapods",

	/**
	 * The pod name or a name for specific subspec e.g. "QueryKit/Attribute".
	 */
	name: string,

	/**
	 * Use latest or specific version of a Pod. See {@link https://guides.cocoapods.org/using/the-podfile.html#specifying-pod-versions|Specifying Pod Versions}
	 */
	version?: string,

}
