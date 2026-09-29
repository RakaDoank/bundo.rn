import {
	appDelegateSwift,
} from "./_app-delegate-swift.mts"

import {
	podfile,
} from "./_podfile.mts"

export function modFiles(
	platform: "macos" | "ios",
) {

	appDelegateSwift(platform)

	podfile(platform)

}
