import * as node_path from "node:path"

import {
	GlobalVars,
} from "../../../../_global-vars/index.mts"

import {
	ConfigHelpers,
} from "../../../_helpers/index.mts"

export function getXcassetsPath(
	platform: "macos",
) {

	const
		projectDirectory =
			node_path.dirname(GlobalVars.configFilePath.get()),

		projectName =
			ConfigHelpers.getProjectName(GlobalVars.appConfig.get(), platform)!

	return node_path.join(
		projectDirectory,
		platform,
		projectName,
		"Assets.xcassets",
	)

}
