import type * as AssetCatalogFormat from "./asset-catalog-format"

/**
 * @see https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/AssetTypes.html
 */
export interface AssetCatalogs {

	/**
	 * Provide app icons in Asset Catalogs.
	 * 
	 * Be aware! This configuration doesn't prevent you to provide incorrect or invalid app icon catalog data.
	 * You may prefer to use our helper such as `Config.Apple.createOSXappiconset()` to provide correct data.
	 * 
	 * If you want to learn it, you can still use Xcode to provide app icon in Asset Catalogs,
	 * and see how Xcode instructs you to provide correct image size for each platform, along with its variant.
	 * 
	 * Based on Apple documentation:
	 * - iOS, iPadOS, tvOS, and watchOS apps can auto-generate all icon variations from a single 1024×1024 pixel image.
	 * - For macOS and tvOS, you need to supply an asset for each size. At a minimum, you must provide all OS X icon sizes: 16x16, 32x32, 128x128, 256x256, 512x512, and 1024x1024.
	 * - For visionOS, you need to supply a single 1024x1024 pixel asset
	 * 
	 * @see https://developer.apple.com/documentation/xcode/configuring-your-app-icon
	 * @see https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/AppIconType.html
	 */
	appiconsets?: AssetCatalogFormat.AppIcon.SetType[],

	/**
	 * Provide image assets in the {@link https://developer.apple.com/documentation/xcode/managing-assets-with-asset-catalogs|Asset Catalogs}.
	 * 
	 * For React Native side, this is useful if you want to bundle your image files by the system, instead of using raw loose file next to the JavaScript bundle, so the system ships only the scale a device needs.
	 * 
	 * ```tsx
	 * // bundo.config.mjs
	 * export default {
	 *   macos: {
	 *     assetCatalogs: {
	 *       imagesets: [{
	 *         name: "FooImg",
	 *         images: [{
	 *           path: "./path/to/your-image.png",
	 *           scale: "1x",
	 *         }, {
	 *           path: "./path/to/your-image-much-larger-scale.png",
	 *           scale: "2x",
	 *         }],
	 *       }],
	 * 
	 *       BarName: {
	 *         imagesets: [{
	 *           name: "MyImage",
	 *           images: [{
	 *             path: "./path/to/my-image.png"
	 *           }],
	 *         }]
	 *       },
	 *     }
	 *   },
	 * }
	 * // ---
	 * 
	 * // React Native
	 * import { Image } from "react-native"
	 * 
	 * export function Component() {
	 *  return (<>
	 *   <Image source={{ uri: "FooImg" }}/>
	 *   <Image source={{ uri: "BarName/MyImage" }}/>
	 *  </>)
	 * }
	 * ```
	 * 
	 * @see https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/ImageSetType.html
	 */
	imagesets?: AssetCatalogFormat.Image.SetType[],

}
