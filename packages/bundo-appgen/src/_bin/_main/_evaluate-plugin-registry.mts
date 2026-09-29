import * as node_fs from "node:fs"
import * as node_module from "node:module"
import * as node_path from "node:path"

import type {
	Config,
	Plugin,
} from "../../index.mts"

import {
	GlobalVars,
} from "../_global-vars/index.mts"

import type {
	EvaluatedPluginRegistry,
} from "../plugin-sandbox-runner/index.ts"

/**
 * Evaluate the plugin registry to get their main function path file and its parameter
 * that will be invoked later through our plugin runner.
 */
export function evaluatePluginRegistry(
	plugins: Config.PluginRegistry | undefined,
): EvaluatedPluginRegistry | undefined {

	if(!plugins?.length) {
		return undefined
	}

	const registry: NonNullable<ReturnType<typeof evaluatePluginRegistry>> = []

	for(const plugin of plugins) {
		let
			nameOrPath: string,

			parameter: Plugin.Context["parameter"] =
				undefined

		if(typeof plugin === "string" && plugin) {
			nameOrPath = plugin
		} else if(Array.isArray(plugin) && plugin.length && typeof plugin[0] === "string" && plugin[0]) {
			nameOrPath = plugin[0]

			if(plugin[1]) {
				if(
					typeof plugin[1] === "object" &&
					plugin[1].constructor === Object
				) {
					parameter = plugin[1]
				} else {
					throw new Error(`The plugin parameter is only supported in plain object. Caused by "${nameOrPath}".`)
				}
			}
		} else {
			throw new Error("The plugin registry is not a valid schema in the config.")
		}

		// test if the plugin is in the node_modules
		const mainPathFromNodeModule = getPluginMainPathFromNodeModules(nameOrPath)
		if(mainPathFromNodeModule) {
			registry.push({
				name: nameOrPath,
				mainPath: mainPathFromNodeModule,
				parameter,
			})
			continue
		}

		// test if the plugin is a local file
		const filePath = node_path.join(
			node_path.dirname(GlobalVars.configFilePath.get()),
			nameOrPath,
		)
		if(node_fs.existsSync(filePath)) {
			const lstat = node_fs.lstatSync(filePath)

			if(lstat.isFile()) {
				registry.push({
					name: nameOrPath,
					mainPath: filePath,
					parameter,
				})
				continue
			} else {
				throw new Error(`${filePath} is not a file.`)
			}
		}

		throw new Error(`"${nameOrPath}" plugin cannot be found.`)
	}

	return registry

}

/**
 * We try to find `bundo.plugin.mjs`, or `bundo.plugin.js`, or their custom JavaScript file in their module directory.
 * 
 * For examples
 * 
 * - "@foo-scope/react-native-module-bar"
 * 	- node_modules/@foo-scope/react-native-module-bar/bundo.plugin.mjs
 * 	- node_modules/@foo-scope/react-native-module-bar/bundo.plugin.js
 * 
 * - "@bar/react-native-module-foo/plugins"
 * 	- node_modules/@bar/react-native-module-foo/plugins/bundo.plugin.mjs
 * 	- node_modules/@bar/react-native-module-foo/plugins/bundo.plugin.js
 * 
 * - "react-native-abc/foo/bar/xyz.js"
 * 	- node_modules/react-native-abc/foo/bar/xyz.js 
 * 
 * This function also resolve the path to actual file path, not the symbolic link.
 */
function getPluginMainPathFromNodeModules(name: string): string | undefined {
	let modulePath: string | undefined
	let isDirectory = true

	try {
		const __require = node_module.createRequire(node_path.join(process.cwd(), "package.json"))
		const nodeModulePaths = __require.resolve.paths("bundo-appgen")

		if(nodeModulePaths?.length) {
			for(const nodeModulePath of nodeModulePaths) {
				const __modulePath = node_path.join(nodeModulePath, name)

				if(node_fs.existsSync(__modulePath)) {
					const modulePathStat = node_fs.lstatSync(__modulePath)

					if(modulePathStat.isFile()) {
						isDirectory = false
					}

					if(modulePathStat.isSymbolicLink()) {
						modulePath = node_fs.realpathSync(__modulePath)
					} else {
						modulePath = __modulePath
					}

					break
				}
			}
		}

		// nothing to found
		if(!modulePath) {
			return undefined
		}
	} catch {
		return undefined
	}

	if(!isDirectory) {
		// `modulePath` is actually a JavaScript file
		// Skip finding the `bundo.plugin.[mjs|js] file`
		return modulePath
	}

	let mainPath: string | undefined

	for(const pluginMainFileExt of pluginMainFileExts) {
		const path = node_path.join(modulePath, `bundo.plugin.${pluginMainFileExt}`)

		if(node_fs.existsSync(path)) {
			// test again for the desired path is symbolic link or not.
			const lstat = node_fs.lstatSync(path)
			if(lstat.isSymbolicLink()) {
				mainPath = node_fs.realpathSync(path)
			} else {
				mainPath = path
			}
			break
		}
	}

	return mainPath
}

const pluginMainFileExts = [
	"mjs",
	"js",
]
