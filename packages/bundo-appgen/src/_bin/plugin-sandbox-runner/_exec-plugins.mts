import * as node_fs from "node:fs"
import * as node_path from "node:path"

import type {
	Plugin,
} from "../../index.mts"

import type {
	ArgvJSON,
} from "./argv-json.ts"

import type {
	PluginRunnerContextResult,
} from "./plugin-runner-context-result.ts"

export async function execPlugins({
	projectDirectory,
	projectName,
	registry,
}: {
	projectDirectory: ArgvJSON["projectDirectory"],
	projectName: ArgvJSON["projectName"],
	registry: ArgvJSON["evaluatedPluginRegistry"],
}): Promise<PluginRunnerContextResult> {

	if(!registry?.length) {
		throw new Error("Not a valid Evaluated Plugin Registry array.")
	}

	const
		paths =
			{
				templates: {
					macos: node_path.join(
						projectDirectory,
						"macos",
					),
				},
			},

		contextResult: PluginRunnerContextResult =
			{
				macos: {
					files: {
						Podfile: node_fs.readFileSync(
							node_path.join(paths.templates.macos, "Podfile"),
							"utf8",
						),
						Project: {
							"AppDelegate.swift": node_fs.readFileSync(
								node_path.join(paths.templates.macos, projectName, "AppDelegate.swift"),
								"utf8",
							),
						},
					},
					infoPlist: {},
				},
			}

	for(const plugin of registry) {
		const pluginMainFn = await import(plugin.mainPath).then((
			mod: {
				default: ((ctx: Plugin.Context) => Promise<void> | void),
			},
		) => {
			return mod.default
		})

		try {
			await pluginMainFn({

				get macos() {
					return {
						get files() {
							return {
								// add(filename, source) {
								// 	contextResult.macos.files.pluginFiles.push({
								// 		filename,
								// 		source,
								// 	})
								// },

								get Podfile() {
									return contextResult.macos.files.Podfile
								},
								set Podfile(value) {
									contextResult.macos.files.Podfile = value
								},

								get Project() {
									return {
										get "AppDelegate.swift"() {
											return contextResult.macos.files.Project["AppDelegate.swift"]
										},
										set "AppDelegate.swift"(value) {
											contextResult.macos.files.Project["AppDelegate.swift"] = value
										},

										// add(filename, source) {
										// 	contextResult.macos.files.Project.pluginFiles.push({
										// 		filename,
										// 		source,
										// 	})
										// },
									} satisfies Plugin.Context["macos"]["files"]["Project"]
								},
							} satisfies Plugin.Context["macos"]["files"]
						},
						infoPlist: contextResult.macos.infoPlist,
						// get Podfile() {
						// 	return {
						// 		pod: contextResult.macos.Podfile.pod,
						// 	} satisfies Plugin.Context["macos"]["Podfile"]
						// },
					} satisfies Plugin.Context["macos"]
				},

				parameter: plugin.parameter,

			})
		} catch(err) {
			if(err instanceof Error) {
				// eslint-disable-next-line preserve-caught-error
				throw new Error(
					plugin.name +
					`${err.stack ? "\n" + err.stack : ""}`,
				)
			}
			throw err
		}
	}

	return contextResult

}
