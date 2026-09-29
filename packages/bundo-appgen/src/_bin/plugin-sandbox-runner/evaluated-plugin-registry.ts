import type {
	Plugin,
} from "../../index.mts"

export type EvaluatedPluginRegistry = {
	/**
	 * This is the name registered in the plugin registry.
	 */
	name: string,
	mainPath: string,
	parameter: Plugin.Context["parameter"],
}[]
