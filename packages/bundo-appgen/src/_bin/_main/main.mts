import * as node_fs from "node:fs"
import * as node_path from "node:path"

import {
	GlobalVars,
} from "../_global-vars/index.mts"

import {
	checkConfigValidity,
} from "./_check-config-validity.mts"

import {
	evaluatePluginRegistry,
} from "./_evaluate-plugin-registry.mts"

import {
	execPluginRunner,
} from "./_exec-plugin-runner/index.mts"

import {
	getConfig,
} from "./_get-config.mts"

import {
	PlatformHelpers,
} from "./_helpers/index.mts"

import {
	initTemplate,
} from "./_init-template/index.mts"

import {
	modPlugin,
} from "./_mod-plugin/index.mts"

import {
	xcodegen,
} from "./_xcodegen/index.mts"

/**
 * Perform actions in this order
 * 
 * - Bundo Config
 * 	- Get the config object from file (e.g. bundo.config.ts)
 * 	- Get the path file of plugin main function including its parameter (all the plugins)
 * 
 * - Init template directory
 * 	- Copy the directory
 * 	- Modify the template file such as AppDelegate.swift regarding the project name and other configs related
 *  - (Apple)
 * 		- Init Asset Catalogs from Config
 *  - (Windows): TODO

 * - Plugin runner
 * 	- Retrieve the result
 * 
 * - (Apple) XcodeGen
 * 	- Create XcodeGen project spec file
 * 	- Run XcodeGen to generate Xcode project
 * 	- Pod installation
 */
export async function main() {

	PlatformHelpers.getData()

	let configFilePath: string = ""

	const argv = GlobalVars.argv.get()

	if(argv.path) {
		const isValidExt = isValidConfigFileExt(argv.path)
		if(!isValidExt) {
			throw new Error(`App config file only compatible with ${configFileExts.join(" | ")}`)
		}

		// Check if the file is existed
		const targetConfigFilePath = node_path.resolve(process.cwd(), argv.path)
		if(!node_fs.existsSync(targetConfigFilePath)) {
			throw new Error(`${targetConfigFilePath} file doesn't exist.`)
		}

		configFilePath = node_path.resolve(process.cwd(), argv.path)
	} else {
		// Find default config file
		for(let i = 0; i < configFileExts.length; i++) {
			const targetConfigFilePath = node_path.join(process.cwd(), `bundo.config.${configFileExts[i]}`)

			if(node_fs.existsSync(targetConfigFilePath)) {
				configFilePath = targetConfigFilePath
				break
			} else if(i == configFileExts.length - 1) {
				throw new Error("Cannot found bundo config file.")
			}
		}
	}

	GlobalVars.configFilePath.set(configFilePath)

	console.log("Retrieving config")
	const config = await getConfig(configFilePath)

	console.log("Validating config")
	checkConfigValidity(config)

	// Now, user app config is available globally in this appgen script at runtime
	GlobalVars.appConfig.set(config)

	console.log("Evaluating the plugin registry if any")
	const pluginRegistry = evaluatePluginRegistry(config.plugins)
	const unrestrictedPluginRegistry = evaluatePluginRegistry(config.lessRestrictivePlugins)

	initTemplate()

	const pluginSandboxedContextResult = await execPluginRunner(
		pluginRegistry,
		{
			mode: "restricted",
		},
	)
	const pluginContextResult = await execPluginRunner(
		unrestrictedPluginRegistry,
		{
			mode: "lessRestrictive",
		},
	)
	if(pluginSandboxedContextResult) {
		modPlugin(pluginSandboxedContextResult)
	}
	if(pluginContextResult) {
		modPlugin(pluginContextResult)
	}

	// TODO : "ios"
	xcodegen(
		"macos",
		{
			infoPlist: {
				...pluginSandboxedContextResult?.macos.infoPlist,
				...pluginContextResult?.macos.infoPlist,
			},
		},
	)

	console.log("\x1b[1m\x1b[32m✔ Native project has been generated successfully.\x1b[0m")

}

const configFileExts: string[] = [
	"ts",
	"mts",
	"mjs",
	"js",
]

function isValidConfigFileExt(filePath: string): boolean {
	const ext = node_path.extname(filePath)
	if(!ext) {
		// empty string from extname returned
		return false
	}
	return configFileExts.indexOf(ext.slice(1)) > -1
}
