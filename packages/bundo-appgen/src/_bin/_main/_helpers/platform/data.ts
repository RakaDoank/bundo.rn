export interface Data {
	developmentRuntime: {
		type: "bun" | "node",
		/**
		 * The semver without the "v" prepended.
		 */
		version: string,
	},
}
