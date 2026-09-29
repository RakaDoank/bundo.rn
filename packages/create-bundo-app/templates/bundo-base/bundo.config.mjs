import {
	Config,
} from "bundo.rn/appgen"

/**
 * @type {import("bundo.rn/appgen").Config.Data}
 */
const config = {

  name: "Hello World",

  macos: {
    appicon: "ReactNativeAppIcon",

    assetCatalogs: {
      appiconsets: [
        // https://developer.apple.com/documentation/xcode/configuring-your-app-icon
        Config.Apple.createOSXappiconset({
          name: "ReactNativeAppIcon",
          images: {
            "1024x1024": "./assets/react-native.png",
            "512x512": "./assets/react-native-512.png",
            "256x256": "./assets/react-native-256.png",
            "128x128": "./assets/react-native-128.png",
            "64x64": "./assets/react-native-64.png",
            "32x32": "./assets/react-native-32.png",
            "16x16": "./assets/react-native-16.png",
          },
        }),
      ],
    },

    buildVersion: "1",
    version: "1.0.0",
    bundleIdentifier: "dev.world.hello",
  },

  plugins: [
    [
      "bundo-window",
      {
        hideTitleBar: true,
      },
    ],
  ],

}

export default config
