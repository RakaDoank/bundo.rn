const
	node_path =
		require("node:path"),

	{ mergeConfig } =
		require("@react-native/metro-config"),

	{ makeMetroConfig } =
		require("@rnx-kit/metro-config"),

	MetroResolverSymlinks =
		require("@rnx-kit/metro-resolver-symlinks")

const
	workspaceDir =
		node_path.join(__dirname, "..", ".."),

	rnxKitMetroConfig =
		makeMetroConfig()

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {

	projectRoot: __dirname,

	resolver: {
		assetExts: [
			...(rnxKitMetroConfig.resolver?.assetExts?.filter(ext => ext !== "svg") ?? []),
		],
		nodeModulesPaths: [
			...rnxKitMetroConfig.resolver?.nodeModulesPaths ?? [],
			node_path.join(__dirname, "node_modules"),
			node_path.join(workspaceDir, "node_modules"),
		],
		resolveRequest: MetroResolverSymlinks(),
		sourceExts: [
			...(rnxKitMetroConfig.resolver?.sourceExts ?? []),
			"svg",
		],
	},

	transformer: {
		babelTransformerPath: require.resolve("react-native-svg-transformer/react-native"),
	},

}

module.exports = mergeConfig(
	rnxKitMetroConfig,
	config,
)
