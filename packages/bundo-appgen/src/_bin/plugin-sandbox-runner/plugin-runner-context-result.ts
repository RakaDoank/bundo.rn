import type {
	Plugin,
} from "../../index.mts"

export interface PluginRunnerContextResult extends Omit<Plugin.Context, "parameter"> {
}

// export interface PluginRunnerContextResult extends Omit<Plugin.Context, "parameter" | "macos"> {
// 	macos: Omit<
// 		Plugin.Context["macos"],
// 		| "files"
// 	> & {
// 		files: Omit<
// 			Plugin.Apple.Files,
// 			| "add"
// 			| "Project"
// 		> & {
// 			Project: Omit<
// 				Plugin.Apple.Files["Project"],
// 				| "add"
// 			> & {
// 				pluginFiles: {
// 					filename: string,
// 					source: string,
// 				}[],
// 			},
// 			pluginFiles: {
// 				filename: string,
// 				source: string,
// 			}[],
// 		}
// 	}
// }
