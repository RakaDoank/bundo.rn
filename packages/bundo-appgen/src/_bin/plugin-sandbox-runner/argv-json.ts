import type {
	EvaluatedPluginRegistry,
} from "./evaluated-plugin-registry"

export interface ArgvJSON {
	/**
	 * Root directory of `bundo-appgen`.
	 * We cannot use the GlobalVars.configFilePath here, because this is already in different JavaScript process/runtime.
	 */
	// bundoAppgenRoot: string,
	projectDirectory: string,
	/**
	 * Project name, not the app display name.
	 */
	projectName: string,

	evaluatedPluginRegistry: EvaluatedPluginRegistry | undefined,

	messageID: string,
}
