import type {
	AssetCatalogs,
} from "./asset-catalogs"

import type {
	AssetCatalogsNamespaced,
} from "./asset-catalogs-namespaced"

import type {
	InfoPlist,
} from "./info-plist"

export interface Data {

	/**
	 * Use one name of `appiconsets` in Asset Catalogs as the app icon.
	 * appgen script will throw an error if the name given is not found in the catalog.
	 */
	appicon?: string,

	/**
	 * Put compatible files as Asset Catalogs in Apple app.
	 * 
	 * Unknown properties will be considered as namespace.
	 * 
	 * @see https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/AssetTypes.html
	 */
	assetCatalogs?: AssetCatalogs | AssetCatalogsNamespaced,

	/**
	 * Build number for your Apple standalone app. Corresponds to `CFBundleVersion` and must match Apple's [specified format](https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleversion).
	 */
	buildVersion: string,

	bundleIdentifier: string,

	/**
	 * Customize the information property list values for your app.
	 * 
	 * For human readable information property list, you can localize the information property through string catalog. See {@link stringCatalogs|`stringCatalogs`}
	 */
	infoPlist?: InfoPlist,

	/**
	 * Provide array of [language identifier](https://developer.apple.com/documentation/xcode/choosing-localization-regions-and-scripts), made up of a [2-letter language code](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) of your desired language, with an optional region code (for example, en-US or en-GB).
	 * 
	 * The first locale in the array will take it as the default language for your app. If there is no locales provided, "en" locale will be used.
	 */
	locales?: string[],

	/**
	 * Apple app minimum deployment.
	 * @default "15.6"
	 */
	minimumDeployment?: string,

	/**
	 * The name of your app as it appears on your home screen as a standalone app.
	 * It will overrides `name` property in the common config.
	 * 
	 * This name will be used also for project name in Xcode with removed spaces and special characters.
	 */
	name?: string,

	/**
	 * Add files to the native bundle resources directory, e.g. "/Applications/Hello World.app/Contents/Resources".
	 * This property expects an array of string, which the string represent as the path, and it can be pointing to a specific file or a directory.
	 * 
	 * For example, "../node_modules/foo-bar-module/xyz/abc" will copy the "abc" including its files if it is directory. Your app will has "abc" under bundle resources directory, e.g. "/Applications/Hello World.app/Contents/Resources/abc".
	 * 
	 * For another real example, you can copy your font files in the bundle resources, and use in your React Native macOS app.
	 * 
	 * ```ts
	 * import type { Config } from "bundo.rn/appgen"
	 * 
	 * export default {
	 * 
	 *   resources: ["./path/to/your/font-files"],
	 * 
	 *   infoPlist: {
	 *     ATSApplicationFontsPath: "font-files/"
	 *   },
	 * 
	 * } satisfies Config.Data
	 * ```
	 */
	resources?: string[],

	/**
	 * Create string catalog in your app for localizable string. This is useful if you want to localize your information property list of your app.
	 * 
	 * For example, to localize your app display name, you can provide a `InfoPlist` string catalog, with `CFBundleDisplayName` object and its key-value for each locale
	 * ```ts
	 * import type { Config } from "bundo.rn/appgen"
	 * 
	 * export default {
	 *   locales: ["en", "de"],
	 * 
	 *   stringCatalogs: {
	 *     InfoPlist: {
	 *       CFBundleDisplayName: {
	 *         en: "Hello World",
	 *         de: "Hallo Welt"
	 *       },
	 *     },
	 *   },
	 * } satisfies Config.Data
	 * ```
	 */
	stringCatalogs?: {
		[CatalogName in string]: {
			[Key in string]: {
				[Locale in string]: string
			}
		}
	},

	/**
	 * This corresponds to `CFBundleShortVersionString`, The required format can be found [here](https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleshortversionstring)
	 */
	version: string,

}
