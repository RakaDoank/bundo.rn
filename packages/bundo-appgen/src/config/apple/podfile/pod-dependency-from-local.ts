export interface PodDependencyFromLocal {

	type: "local",

	/**
	 * The pod name or a name for specific subspec e.g. "QueryKit/Attribute".
	 */
	name: string,

	/**
	 * Using the files from a local folder to the machine.
	 */
	path: string,

}
