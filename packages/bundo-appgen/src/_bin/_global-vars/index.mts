import type {
	Config,
} from "../../index.mts"

import {
	globalVars,
} from "./_global-vars.mts"

export namespace GlobalVars {

	/**
	 * This is evaluated bundo.config.ts from user app.
	 */
	export const appConfig = globalVars<Config.Data>("app_config", {})

	export const argv = globalVars("argv", {
		clean: false,
		forceCrossPlatform: false,
		path: "",
		xcodegenPath: "",
	})

	/**
	 * `bundo-appgen` directory
	 */
	export const appgenRoot = globalVars("appgen_root", "")

	export const configFilePath = globalVars("config_file_path", "")

}
