import * as node_fs from "node:fs"
import * as node_path from "node:path"

import {
	GlobalVars,
} from "../../../_global-vars/index.mts"

import {
	ConfigHelpers,
} from "../../_helpers/index.mts"

export function modKnownRegions(
	platform: "macos" | "ios",
) {
	const
		config =
			GlobalVars.appConfig.get(),

		appleData =
			config[platform as "macos"] // TODO : ios

	if(!appleData?.locales?.length) {
		return
	}

	const
		projectName =
			ConfigHelpers.getProjectName(config, platform),

		pbxprojPath =
			node_path.join(
				node_path.dirname(GlobalVars.configFilePath.get()),
				platform,
				`${projectName}.xcodeproj`,
				"project.pbxproj",
			)

	let file = node_fs.readFileSync(pbxprojPath, "utf8")

	let strReplacer = "knownRegions = ("
	appleData.locales.forEach(locale => {
		strReplacer += `\n$2${locale},`
	})
	strReplacer += "$3"

	file = file.replace(
		/knownRegions = \((\n(\t+)\w+,)+(\n\t+\);)/,
		strReplacer,
	)

	node_fs.writeFileSync(pbxprojPath, file, "utf8")
}
