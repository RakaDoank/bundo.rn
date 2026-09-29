import type {
	Config,
} from "../../index.mts"

import {
	GlobalVars,
} from "../_global-vars/index.mts"

import {
	ConfigHelpers,
} from "./_helpers/index.mts"

export function checkConfigValidity(
	config: Config.Data,
) {

	if(
		!config.macos /* && !config.windows */
	) {
		throw new Error("No platforms configuration.")
	}

	const isCrossPlatform = GlobalVars.argv.get().forceCrossPlatform

	if(isCrossPlatform) {
		checkMacosConfig(config)
		// TODO windows
	} else if(process.platform == "darwin") {
		checkMacosConfig(config)
	} else if(process.platform == "win32") {
		// TODO windows
	}

	// check plugin
	if(config.plugins) {
		if(Array.isArray(config.plugins)) {
			config.plugins.forEach(plugin => {
				let isValid = true

				if(Array.isArray(plugin) && plugin.length) {
					isValid = typeof plugin[0] === "string"

					if(plugin.length > 2) {
						isValid = false
					} else if(plugin[1]) {
						isValid = typeof plugin[1] === "object" && plugin[1].constructor === Object
					}
				} else if(typeof plugin === "string" && !plugin.length) {
					isValid = false
				}

				if(!isValid) {
					throw new Error("Plugin item needs to be an string of the plugin name, or an array of the plugin name and its parameter.")
				}
			})
		} else {
			throw new Error("Expected an Array in the plugin registry.")
		}
	}

}

class OSFieldError extends Error {

	constructor(
		prop: string,
		os: "macos" | "windows",
	) {
		super(`\`${prop}\` is required for ${os} app.`)
	}

}

function checkMacosConfig(config: Config.Data) {
	if(!ConfigHelpers.getName(config, "macos")) {
		throw new Error("`name` or `macos.name` is required in the config.")
	}

	if(!config.macos) {
		throw new Error(`Missing macos property in the config.`)
	}

	if(!config.macos.buildVersion) {
		throw new OSFieldError("buildVersion", "macos")
	}

	if(!config.macos.bundleIdentifier) {
		throw new OSFieldError("bundleIdentifier", "macos")
	}

	if(!config.macos.version) {
		throw new OSFieldError("version", "macos")
	}
}
