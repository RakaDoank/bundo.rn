import type {
	Config,
} from "../../../../index.mts"

/**
 * Get the app name from the config. This function is not guaranteed to return valid string due to missing value in the config object.
 */
export function getName(
	config: Config.Data,
	platform:
		| "macos"
		| "windows"
		| "ios",
): string | undefined {

	if(platform == "macos") {
		return config.macos?.name || config.name
	}

	// TODO: Windows

	return config.name

}
