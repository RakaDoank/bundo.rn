import semverSatisfies from "semver/functions/satisfies.js"

import {
	GlobalVars,
} from "../../../_global-vars/index.mts"

/**
 * This is a mono helper if the bundo runs for non compatible platform and JS development runtime.
 */
export function isCompatible(): boolean {

	const
		/**
		 * We only support macOS and Windows for bundo-appgen,
		 * unless client is using the option `--force-cross-platform`.
		 */
		supportdRNPlatforms: NodeJS.Platform[] =
			[
				"darwin",
				"win32",
			],

		osCompatible =
			supportdRNPlatforms.indexOf(process.platform) > -1

	if(!osCompatible) {
		return GlobalVars.argv.get().forceCrossPlatform
	}

	if(process.versions.bun) {
		return semverSatisfies(process.versions.bun, "^1")
	}

	if(process.versions.node) {
		return semverSatisfies(process.versions.node, ">=22")
	}

	return false

}
