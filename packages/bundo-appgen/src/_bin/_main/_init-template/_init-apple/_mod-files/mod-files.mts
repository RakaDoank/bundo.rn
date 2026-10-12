import {
	appDelegateSwift,
} from "./_app-delegate-swift.mts"

import {
	podfile,
} from "./_podfile/index.mts"

import {
	privacyManifest,
} from "./_privacy-manifest.mts"

export function modFiles(
	platform: "macos",
) {

	appDelegateSwift(platform)

	podfile(platform)

	privacyManifest(platform)

}
