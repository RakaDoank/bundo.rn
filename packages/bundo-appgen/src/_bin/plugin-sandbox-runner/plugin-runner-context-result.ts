import type {
	Plugin,
} from "../../index.mts"

export interface PluginRunnerContextResult extends Omit<Plugin.Context, "parameter"> {
}
