import * as node_childProcess from "node:child_process"
import * as node_fs from "node:fs"
import * as node_module from "node:module"
import * as node_path from "node:path"

import {
	GlobalVars,
} from "../../_global-vars/index.mts"

import type {
	EvaluatedPluginRegistry,
	PluginRunnerContextResult,
} from "../../plugin-sandbox-runner/index.ts"

import type * as PluginSandboxRunnerType from "../../plugin-sandbox-runner/index.ts"

/**
 * We allow some fs read for some directories by default
 * - node_modules directory lookup
 * - plugins directory
 */
export async function spawnPluginSandboxRunner(
	registry: EvaluatedPluginRegistry,
	permissions: {
		"--allow-fs-read": string[] | null,
		"--allow-fs-write": string[] | null,
		"--allow-net": boolean,
	},
	metadata: {
		projectDirectory: string,
		projectName: string,
	},
): Promise<PluginRunnerContextResult> {
	const
		requireModule =
			node_module.createRequire(process.cwd()),

		messageID =
			Math.random().toString()

	return new Promise(resolve => {
		const nodeArgs: string[] = [
			"--permission",
		]

		permissions["--allow-fs-read"]?.forEach(path => {
			nodeArgs.push(`--allow-fs-read=${path}`)
		})

		permissions["--allow-fs-write"]?.forEach(path => {
			nodeArgs.push(`--allow-fs-write=${path}`)
		})

		if(permissions["--allow-net"]) {
			nodeArgs.push("--allow-net")
		}

		// allow read for node_modules directory
		// required for plugins to use their external module
		requireModule.resolve.paths("bundo-appgen")?.forEach(nodeModulePath => {
			if(nodeModulePath.slice(-("/node".length)) != "/node") {
				nodeArgs.push(`--allow-fs-read=${nodeModulePath}`)
			}
		})

		// allow read for plugins directory
		// required for plugins to use their own splitted JavaScript files in their own directory
		registry.forEach(plugin => {
			const pluginDirectory = node_path.dirname(plugin.mainPath)
			const lstat = node_fs.lstatSync(pluginDirectory)

			if(lstat.isSymbolicLink()) {
				nodeArgs.push(`--allow-fs-read=${node_fs.realpathSync(pluginDirectory)}`)
			} else {
				nodeArgs.push(`--allow-fs-read=${pluginDirectory}`)
			}
		})

		// exec plugin-sandbox-runner.mjs
		nodeArgs.push(
			node_path.join(
				GlobalVars.appgenRoot.get(),
				"lib", "bin", "plugin-sandbox-runner.mjs",
			),
		)
		// and its arguments
		nodeArgs.push(
			`--json=${JSON.stringify({
				projectDirectory: metadata.projectDirectory,
				projectName: metadata.projectName,
				evaluatedPluginRegistry: registry,
				messageID,
			} satisfies PluginSandboxRunnerType.ArgvJSON)}`,
		)

		// -------------------------------
		// ----- SPAWN A NEW PROCESS -----
		// -------------------------------

		const pluginRunner = node_childProcess.spawn(
			"node",
			nodeArgs,
			{
				stdio: [
					"pipe",
					"pipe",
					"inherit",
					"ipc",
				],
			},
		)

		let message: string

		pluginRunner.on("message", clientMessage => {
			if(typeof clientMessage === "string") {
				message = clientMessage
			}
		})

		pluginRunner.on("exit", code => {
			if(code == 0) {
				if(message) {
					// Improve me!
					// Only trust specific JSON message here

					const json = JSON.parse(message) as Record<string, unknown>

					// See /packages/bundo-appgen/plugin-sandbox-runner.mts
					// Check the contract
					if(
						json.messageID === messageID &&

						json.macos &&
						typeof json.macos === "object"
					) {
						delete json.messageID
						resolve(json as PluginRunnerContextResult)
					} else {
						throw new Error("Plugin Sandbox Runner was not sending a valid result.")
					}
				} else {
					throw new Error("Plugin Sandbox Runner was not sending a valid result.")
				}
			} else {
				throw new Error(`Plugin Sandbox Runner exited with ${code} code`)
			}
		})
	})
}
