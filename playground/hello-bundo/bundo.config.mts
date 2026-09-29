import * as node_path from "node:path"

import {
	Config,
} from "bundo.rn/appgen"

const bundoBaseAssetsPath = node_path.join(
	import.meta.dirname,
	"..", "..", "packages", "create-bundo-app", "templates", "bundo-base", "assets",
)

export default {
	name: "Hello Bundo",

	macos: {
		appicon: "ReactNativeAppIcon",

		assetCatalogs: {
			// https://developer.apple.com/documentation/xcode/configuring-your-app-icon
			appiconsets: [
				Config.Apple.createOSXappiconset({
					name: "ReactNativeAppIcon",
					images: {
						"1024x1024":
							node_path.join(bundoBaseAssetsPath, "react-native.png"),
						"512x512":
							node_path.join(bundoBaseAssetsPath, "react-native-512.png"),
						"256x256":
							node_path.join(bundoBaseAssetsPath, "react-native-256.png"),
						"128x128":
							node_path.join(bundoBaseAssetsPath, "react-native-128.png"),
						"64x64":
							node_path.join(bundoBaseAssetsPath, "react-native-64.png"),
						"32x32":
							node_path.join(bundoBaseAssetsPath, "react-native-32.png"),
						"16x16":
							node_path.join(bundoBaseAssetsPath, "react-native-16.png"),
					},
				}),
			],

			imagesets: [{
				name: "julia_solonina_unsplash",
				images: [{
					path: "./assets/julia-solonina-unsplash.jpg",
				}],
			}],

			// "Unsplash" namespace
			Unsplash: {
				imagesets: [{
					name: "julia_solonina_unsplash",
					images: [{
						path: "./assets/julia-solonina-unsplash.jpg",
					}],
				}],
			},
		},
		buildVersion: "8",
		bundleIdentifier: "dev.bundo.hello",
		version: "1.0.0",

		resources: [
			"../../node_modules/@audira/carbon-react-native/assets/fonts",
		],

		infoPlist: {
			ATSApplicationFontsPath: "fonts/",
		},

		locales: ["en", "id"],

		stringCatalogs: {
			InfoPlist: {
				CFBundleDisplayName: {
					"en": "Hello Bundo",
					"id": "Halo Bundo",
				},
			},
		},
	},

	plugins: [
		[
			"bundo-window",
			{
				hideTitleBar: true,
			},
		],
	],
} satisfies Config.Data
