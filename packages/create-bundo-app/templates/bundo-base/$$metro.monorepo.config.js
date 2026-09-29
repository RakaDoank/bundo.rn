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

  workspaceNodeModules =
    node_path.join(workspaceDir, "node_modules"), // ../../node_modules

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
    nodeModulesPaths: [
      node_path.join(__dirname, "node_modules"), // ./node_modules
      workspaceNodeModules,
    ],
    resolveRequest: MetroResolverSymlinks(),
  },

  watchFolders: [
    node_path.join(workspaceDir, "packages"),
    workspaceNodeModules,
  ],

}

module.exports = mergeConfig(
  rnxKitMetroConfig,
  config,
)
