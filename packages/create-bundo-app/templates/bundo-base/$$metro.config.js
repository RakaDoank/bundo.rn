const
  {
    getDefaultConfig,
    mergeConfig,
  } =
    require("@react-native/metro-config")

const
  defaultConfig =
    getDefaultConfig()

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {

  projectRoot: __dirname,

}

module.exports = mergeConfig(
  defaultConfig,
  config,
)
