import * as node_fs from "node:fs"
import * as node_path from "node:path"

import {
	GlobalVars,
} from "../../../_global-vars/index.mts"

import {
	ConfigHelpers,
} from "../../_helpers/index.mts"

import {
	createAssetCatalogs,
} from "./_create-asset-catalogs/index.mts"

import {
	createStringCatalogs,
} from "./_create-string-catalogs/create-string-catalog.mts"

import {
	modFiles,
} from "./_mod-files/index.mts"

export function initApple(
	platform: "macos" | "ios",
) {
	const
		// config.macos is already checked at bundo-appgen/src/_bin/_main/main.mts
		config =
			GlobalVars.appConfig.get(),

		projectDirectory =
			node_path.dirname(GlobalVars.configFilePath.get()),

		nativeProjectDirectory =
			node_path.join(projectDirectory, platform),

		/**
		 * - bundo-appgen/template/macos
		 * - bundo-appgen/template/windows
		 */
		templateDir =
			node_path.join(GlobalVars.appgenRoot.get(), "template", platform),

		projectName =
			ConfigHelpers.getProjectName(config, platform)! // config object is already validated

	if(!node_fs.existsSync(nativeProjectDirectory)) {
		// TODO : cache strategy
		// copy the template directory to the user project directory
		node_fs.cpSync(templateDir, nativeProjectDirectory, { recursive: true })

		node_fs.renameSync(
			node_path.join(nativeProjectDirectory, "HelloWorld"),
			node_path.join(nativeProjectDirectory, projectName),
		)

		modFiles(platform)
	}

	// Intentionally asserted as "macos"
	// TODO : "ios"
	const appleData = config[platform as "macos"]!

	createAssetCatalogs(
		appleData.assetCatalogs,
		{
			bundleIdentifier: appleData.bundleIdentifier,
			platform,
			projectName,
		},
	)

	createStringCatalogs(
		appleData.stringCatalogs,
		appleData.locales,
		{
			platform,
		},
	)
}
