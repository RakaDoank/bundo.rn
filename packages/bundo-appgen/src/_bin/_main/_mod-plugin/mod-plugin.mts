import * as node_fs from "node:fs"
import * as node_path from "node:path"

import {
	GlobalVars,
} from "../../_global-vars/index.mts"

import type {
	PluginRunnerContextResult,
} from "../../plugin-sandbox-runner/index.ts"

import {
	ConfigHelpers,
} from "../_helpers/index.mts"

export function modPlugin(
	contextResult: PluginRunnerContextResult,
) {

	const
		config =
			GlobalVars.appConfig.get(),

		projectDirectory =
			node_path.dirname(
				GlobalVars.configFilePath.get(),
			)

	{
		// TODO : ios

		const
			projectName =
				ConfigHelpers.getProjectName(config, "macos")!, // already validated

			nativeProjectDir =
				node_path.join(projectDirectory, "macos")

		node_fs.writeFileSync(
			node_path.join(
				nativeProjectDir,
				projectName,
				"AppDelegate.swift",
			),
			contextResult.macos.files.Project["AppDelegate.swift"],
			"utf8",
		)

		// if(contextResult.macos.files.Project.pluginFiles.length) {
		// 	contextResult.macos.files.Project.pluginFiles.forEach(pluginFile => {
		// 		node_fs.writeFileSync(
		// 			node_path.join(nativeProjectDir, projectName, pluginFile.filename),
		// 			pluginFile.source,
		// 			"utf8",
		// 		)
		// 	})
		// }

		node_fs.writeFileSync(
			node_path.join(nativeProjectDir, "Podfile"),
			contextResult.macos.files.Podfile,
			"utf8",
		)

		// if(contextResult.macos.files.pluginFiles.length) {
		// 	contextResult.macos.files.pluginFiles.forEach(pluginFile => {
		// 		node_fs.writeFileSync(
		// 			node_path.join(nativeProjectDir, pluginFile.filename),
		// 			pluginFile.source,
		// 			"utf8",
		// 		)
		// 	})
		// }

	}

}
