import * as node_path from "node:path"

import {
	GlobalVars,
} from "../../_global-vars/index.mts"

import type {
	EvaluatedPluginRegistry,
	PluginRunnerContextResult,
} from "../../plugin-sandbox-runner/index.ts"

import {
	ConfigHelpers,
} from "../_helpers/index.mts"

import {
	spawnPluginSandboxRunner,
} from "./_spawn-plugin-sandbox-runner.mts"

export async function execPluginRunner(
	registry: EvaluatedPluginRegistry | undefined,
	options?: {
		mode:
			| "restricted"
			| "lessRestrictive",
	},
): Promise<PluginRunnerContextResult | undefined> {

	if(!registry?.length) {
		return undefined
	}

	const
		projectDirectory =
			node_path.dirname(GlobalVars.configFilePath.get()),

		projectName =
			ConfigHelpers.getProjectName(GlobalVars.appConfig.get(), "macos")! // already validated

	if(options?.mode === "restricted") {
		console.log(`Executing ${registry.length} plugin${registry.length == 1 ? "" : "s"}`)
		return await spawnPluginSandboxRunner(
			registry,
			{
				"--allow-fs-read": [
					// +++++ allow read for specific template files +++++
					node_path.join(
						projectDirectory,
						"macos", projectName, "AppDelegate.swift",
					),

					node_path.join(
						projectDirectory,
						"macos", "Podfile",
					),
					// ----- allow read for specific template files -----
				],
				"--allow-fs-write": null,
				"--allow-net": false,
			},
			{
				projectDirectory,
				projectName,
			},
		)
	} else {
		console.log(`Executing ${registry.length} less restrictive plugin${registry.length == 1 ? "" : "s"}`)

		const
			projectDirectoryMacos =
				node_path.join(projectDirectory, "macos")
		// TODO - Windows

		return await spawnPluginSandboxRunner(
			registry,
			{
				"--allow-fs-read": [
					projectDirectoryMacos,
				],
				"--allow-fs-write": [
					projectDirectoryMacos,
				],
				"--allow-net": true,
			},
			{
				projectDirectory,
				projectName,
			},
		)
	}

}
