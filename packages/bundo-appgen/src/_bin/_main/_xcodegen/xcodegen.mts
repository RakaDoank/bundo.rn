import * as node_childProcess from "node:child_process"
import * as node_path from "node:path"

import {
	GlobalVars,
} from "../../_global-vars/index.mts"

import {
	createProjectSpec,
} from "./_create-project-spec/index.mts"

import {
	modKnownRegions,
} from "./_mod-known-regions/mod-known-regions.mts"

export function xcodegen(
	platform: "macos" | "ios",
	overrideConfig?: Parameters<typeof createProjectSpec>[1],
) {
	createProjectSpec(platform, overrideConfig)

	const
		xcodegenPath =
			GlobalVars.argv.get().xcodegenPath,

		nativeProjectDir =
			node_path.join(node_path.dirname(GlobalVars.configFilePath.get()), platform)

	node_childProcess.execSync(
		`${xcodegenPath} --spec project.json`,
		{
			cwd: nativeProjectDir,
			stdio: "inherit",
		},
	)

	modKnownRegions(platform)

	node_childProcess.execSync(
		`pod install`,
		{
			cwd: nativeProjectDir,
			stdio: "inherit",
		},
	)
}
