import * as node_fs from "node:fs"
import * as node_path from "node:path"

import {
	GlobalVars,
} from "../../../../_global-vars/index.mts"

import {
	ConfigHelpers,
} from "../../../_helpers/index.mts"

export function appDelegateSwift(
	platform: "macos" | "ios",
) {

	const
		appConfig =
			GlobalVars.appConfig.get(),

		projectName =
			ConfigHelpers.getProjectName(appConfig, platform),

		appName =
			ConfigHelpers.getName(
				appConfig,
				platform,
			)!,

		appDelegateSwiftFilePath =
			node_path.join(
				node_path.dirname(GlobalVars.configFilePath.get()),
				platform,
				ConfigHelpers.getProjectName(
					GlobalVars.appConfig.get(),
					platform,
				)!,
				"AppDelegate.swift",
			)

	let
		appDelegateSwiftText =
			node_fs.readFileSync(
				appDelegateSwiftFilePath,
				"utf8",
			)

	appDelegateSwiftText = appDelegateSwiftText
		.replace(/Window\("HelloWorld"/, `Window("${appName}"`)

	appDelegateSwiftText = appDelegateSwiftText
		.replace(
			/factory.rootViewFactory.view\(withModuleName: "HelloWorld"/,
			`factory.rootViewFactory.view(withModuleName: "${projectName}"`,
		)

	node_fs.writeFileSync(
		appDelegateSwiftFilePath,
		appDelegateSwiftText,
		"utf8",
	)

}
