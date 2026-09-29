import * as node_fs from "node:fs"
import * as node_module from "node:module"
import * as node_path from "node:path"

import type * as Config from "../../../../config/index.mts"

import {
	GlobalVars,
} from "../../../_global-vars/index.mts"

import {
	ConfigHelpers,
} from "../../_helpers/index.mts"

import {
	initResources,
} from "./_init-resources.mts"

/**
 * Create `project.json` file in the "&lt;project&gt;/macos" directory.
 */
export function createProjectSpec(
	platform: "macos" | "ios",
	overrideConfig?: {
		infoPlist?: Config.Apple.Data["infoPlist"],
	},
) {

	const
		projectDirectory =
			node_path.dirname(GlobalVars.configFilePath.get()),

		nativeProjectDir =
			node_path.join(projectDirectory, platform)

	// just in case if the projectDirectory doesn't exist
	if(!node_fs.existsSync(projectDirectory)) {
		throw new Error(`An unexpected happened. ${projectDirectory} was not found.`)
	}

	const
		config =
			GlobalVars.appConfig.get()

	// TODO : also check for "ios"
	if(
		config.macos?.appicon &&
		(
			!config.macos.assetCatalogs?.appiconsets?.length ||
			!config.macos.assetCatalogs.appiconsets.some(set => set.name == config.macos?.appicon)
		)
	) {
		// check if the appicon name is exist
		throw new Error(`No appicon with the name "${config.macos.appicon}" was found in the appiconsets in Asset Catalogs.`)
	}

	if(
		(platform == "macos" && !config.macos)
		// TODO : "ios"
	) {
		throw new Error(`${platform} configuration was not found.`)
	}

	const
		requireFromNativeDirectory =
			node_module.createRequire(nativeProjectDir),

		reactNativeXcodeScriptRelativePath =
			node_path.relative(
				nativeProjectDir,
				platform == "macos"
					? requireFromNativeDirectory.resolve("react-native-macos/scripts/react-native-xcode.sh")
					: requireFromNativeDirectory.resolve("react-native/scripts/react-native-xcode.sh"),
			),

		appleData: Config.Apple.Data =
			// Intentionally asserted as "macos"
			// TODO : "ios"
			{
				...config[platform as "macos"]!,
				infoPlist: {
					...overrideConfig?.infoPlist,
					...config[platform as "macos"]!.infoPlist, // client's infoPlist takes precedence over the plugin
				},
			},

		projectName =
			ConfigHelpers.getProjectName(config, platform)!, // already validated

		resourcesData =
			initResources(
				config.macos?.resources,
				{
					platform,
				},
			),

		/* eslint-disable @typescript-eslint/no-explicit-any */

		/**
		 * See https://github.com/yonaskolb/XcodeGen/blob/master/Docs/ProjectSpec.md
		 */
		json: Record<string, any> =
			{

				name: projectName,

				// https://github.com/yonaskolb/XcodeGen/blob/master/Docs/ProjectSpec.md#target
				targets: {
					[projectName]: {
						type: "application",
						platform: platform == "macos" ? "macOS" : "iOS",
						deploymentTarget: appleData.minimumDeployment || "15.6",
						sources: [
							{
								path: projectName,
								type: "syncedFolder",
							},
							...(resourcesData?.map(resource => {
								/**
								 * The path "Resources" is just our group, and also our custom directory,
								 * not an actual bundle resource directory content of macOS app, e.g. /Applications/HelloWorld.app/Contents/Resources.
								 * The naming is purely a coincidence.
								 * 
								 * We intentionally to copy user files to our directory called "Resources".
								 * Any user files will be copied to our "Resources" directory.
								 * 
								 * See placing content in a bundle
								 * https://developer.apple.com/documentation/bundleresources/placing-content-in-a-bundle?language=objc
								 */
								return {
									path: "Resources",
									buildPhase: {
										copyFiles: {
											destination: "resources",
											subpath: resource.isDirectory
												? resource.basename
												: undefined,
										},
									},
								}
							}) ?? []),
						],
						info: {
							path: `${projectName}/Info.plist`,
							properties: {
								CFBundleDisplayName: ConfigHelpers.getName(config, platform),
								CFBundleShortVersionString: "$(MARKETING_VERSION)",
								CFBundleVersion: "$(CURRENT_PROJECT_VERSION)",
								NSAppTransportSecurity: {
									NSAllowsArbitraryLoads: true,
									NSExceptionDomains: {
										localhost: {
											NSExceptionAllowsInsecureHTTPLoads: true,
										},
									},
								},
								NSPrincipalClass: "NSApplication",
								NSSupportsAutomaticTermination: true,
								NSSupportsSuddenTermination: true,
								// Let user override these properties
								...appleData.infoPlist,
							},
						},
						postBuildScripts: [
							{
								name: "Bundle React Native code and images",
								script: `export NODE_BINARY=node\n${reactNativeXcodeScriptRelativePath}`,
							},
						],

						scheme: {},

						settings: {
							ASSETCATALOG_COMPILER_APPICON_NAME: appleData.appicon,
						},
					},
				},

				/**
				 * Settings correspond to Build Settings tab in Xcode.
				 * 
				 * See {@link https://developer.apple.com/documentation/xcode/build-settings-reference|Build settings reference} for complete detailed list of individual Xcode build settings that control or change the way a target is built.
				 * 
				 * @see https://github.com/yonaskolb/XcodeGen/blob/master/Docs/ProjectSpec.md#settings
				 */
				settings: {
					base: {
						ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS: true,
						CODE_SIGN_STYLE: "Automatic",
						CURRENT_PROJECT_VERSION: appleData.buildVersion || "1",
						GENERATE_INFOPLIST_FILE: true,
						LD_RUNPATH_SEARCH_PATHS: "$(inherited) @executable_path/Frameworks",
						MARKETING_VERSION: appleData.version || "1.0.0",
						OTHER_LDFLAGS: "$(inherited) -ObjC -lc++",
						PRODUCT_BUNDLE_IDENTIFIER: appleData.bundleIdentifier,
					},
				},

				options: {
					useBaseInternationalization: false,
				},

			}

	/* eslint-enable @typescript-eslint/no-explicit-any */

	node_fs.writeFileSync(
		node_path.join(
			nativeProjectDir, "project.json",
		),
		JSON.stringify(json, null, 2),
		"utf8",
	)

}
