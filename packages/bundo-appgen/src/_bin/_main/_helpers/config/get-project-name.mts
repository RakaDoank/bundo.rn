import {
	getName,
} from "./get-name.mts"

let cache: string

/**
 * Get the project name for Xcode or Visual Studio. This function is not guaranteed to return valid string due to missing value in the config object.
 */
export function getProjectName(
	...params: Parameters<typeof getName>
): string | undefined {

	if(cache) {
		return cache
	}

	const name = getName(...params)

	if(!name) {
		return undefined
	}

	cache = name.replace(/[^a-zA-Z0-9]/g, "")
	return cache

}
