const
	node_path =
		require("node:path"),

	bundoWindowPackageJson =
		require("../../packages/bundo-window/package.json")

/**
 * @type {import("@react-native-community/cli-types").Config}
 * @see {@link https://github.com/react-native-community/cli/blob/main/docs/configuration.md}
 */
module.exports = {
	dependencies: {
		// https://github.com/react-native-community/cli/blob/main/docs/autolinking.md#how-can-i-autolink-a-local-library
		[bundoWindowPackageJson.name]: {
			root: node_path.join(__dirname, "..", "..", "packages", "bundo-window"),
		},
	},
}
