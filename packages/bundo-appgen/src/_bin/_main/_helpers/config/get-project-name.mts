import {
	getName,
} from "./get-name.mts"

let cacheMacos: string

/**
 * Get the project name for Xcode or Visual Studio. This function is not guaranteed to return valid string due to missing value in the config object.
 */
export function getProjectName(
	...params: Parameters<typeof getName>
): string | undefined {

	if(params[1] == "macos" && cacheMacos) {
		return cacheMacos
	}
	// TODO other platforms

	const name = getName(...params)

	if(!name) {
		return undefined
	}

	if(params[1] == "macos") {
		cacheMacos = name.replace(/[^a-zA-Z0-9]/g, "")
		return cacheMacos
	}

	return undefined

}
