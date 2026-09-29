import type * as Apple from "./apple"

export interface Context<PluginParam extends object = object> {

	/**
	 * An object that user passed to your plugin through plugin registry.
	 */
	readonly parameter: PluginParam | undefined,

	readonly macos: Apple.Context,

}
