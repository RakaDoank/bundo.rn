import {
	globalVars,
} from "./_global-vars.mts"

export namespace GlobalVars {

	/**
	 * `create-bundo-app` directory
	 */
	export const root = globalVars("root", "")

	export const templatesDir = globalVars("templates_dir", "")

	export const platform = globalVars<
		| "macos+windows"
		| "macos"
		| "windows"
	>("platform", "macos+windows")

	export const packageManager = globalVars<
		| "bun"
		| "pnpm"
		| "npm"
	>("package_manager", "bun")

}
