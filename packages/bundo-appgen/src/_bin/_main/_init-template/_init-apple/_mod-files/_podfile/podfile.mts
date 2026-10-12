import * as node_fs from "node:fs"
import * as node_path from "node:path"

import {
	GlobalVars,
} from "../../../../../_global-vars/index.mts"

import {
	ConfigHelpers,
} from "../../../../_helpers/index.mts"

import {
	podDependencies,
} from "./_pod-dependencies.mts"

export function podfile(
	platform: "macos",
) {

	const
		projectName =
			ConfigHelpers.getProjectName(GlobalVars.appConfig.get(), platform)!, // already validated

		nativeProjectDir =
			node_path.join(
				node_path.dirname(GlobalVars.configFilePath.get()),
				platform,
			),

		podfilePath =
			node_path.join(nativeProjectDir, "Podfile")

	let
		podfileText =
			node_fs.readFileSync(podfilePath, "utf8")

	podfileText = podfileText.replace(/(target) 'HelloWorld' (do)/, `$1 '${projectName}' $2`)

	node_fs.writeFileSync(podfilePath, podfileText, "utf8")

	podDependencies(platform)

}
