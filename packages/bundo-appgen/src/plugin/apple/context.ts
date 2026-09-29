import type * as Config from "../../config/index.mts"

import type {
	Files,
} from "./files"

// import type {
// 	PodSpecSourceFromCocoapods,
// } from "./pod-spec-source-from-cocoapods"

// import type {
// 	PodSpecSourceFromGit,
// } from "./pod-spec-source-from-git"

// import type {
// 	PodSpecSourceFromLocal,
// } from "./pod-spec-source-from-local"

export interface Context {

	// /**
	//  * @deprecated
	//  * It will be replaced by Swift Package Manager in the future.
	//  * We need to wait until React Native and React Native macOS support Swift Package Manager completely.
	//  * 
	//  * @see https://guides.cocoapods.org/using/the-podfile.html
	//  */
	// readonly Podfile: {
	// 	/**
	// 	 * Add a Pod for client application.
	// 	 * 
	// 	 * The Pod array is initially an empty array, but incrementally added and overwritten by other plugins.
	// 	 */
	// 	readonly pod: {
	// 		name: string,
	// 		source:
	// 			| PodSpecSourceFromCocoapods
	// 			| PodSpecSourceFromGit
	// 			| PodSpecSourceFromLocal
	// 	}[],
	// },

	/**
	 * Read and modify the templated files in raw source text.
	 * 
	 * The initial source text will be the client app files.
	 * If the `appgen` run for the first time or clean run, the source text will be the `bundo-appgen` templates files.
	 * 
	 * The source text is incrementally modified by client, other plugins, and yours.
	 * Be careful about modifying the source text file.
	 * 
	 * See the directory `bundo-appgen/templates` in the node_modules
	 * or in our GitHub repository for your references.
	 */
	readonly files: Files,

	/**
	 * Write a Info Plist for client app.
	 * 
	 * The Info Plist object is initially an empty object,
	 * which means you cannot read what is the current Info Plist configuration from client configuration,
	 * but incrementally added and overwritten by other plugins.
	 * 
	 * The Info Plist result from plugin cannot overwrite an Info Plist item of client app with the same key.
	 */
	readonly infoPlist: Config.Apple.InfoPlist,

}
