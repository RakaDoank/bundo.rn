import type {
	Appearances,
} from "../appearances"

import type {
	Idiom,
} from "../idiom"

// import type {
// 	ColorSpace,
// } from "./color-space"

import type {
	CompressionType,
} from "./compression-type"

import type {
	DisplayGamut,
} from "./display-gamut"

import type {
	LanguageDirection,
} from "./language-direction"

import type {
	Scale,
} from "./scale"

/**
 * @see https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/ImageSetType.html
 */
export interface SetType {

	/**
	 * This is the actual image name and also be used for the .imageset folder name.
	 * 
	 * For example, if the name is `FooBar`, a "FooBar.imageset" directory will be created under our Asset Catalogs directory template.
	 * You can check later at "macos/&lt;Project&gt;/Assets.xcassets/FooBar.imageset".
	 * 
	 * Then, you can access use the image in React Native by the name,
	 * ```tsx
	 * import { Image } from "react-native"
	 * 
	 * export function Component() {
	 *  return (<>
	 *   <Image source={{ uri: "FooBar" }}/>
	 * 
	 *   // if a namespace is given
	 *   <Image source={{ uri: "WithNamespace/FooBar" }}/>
	 *  </>)
	 * }
	 * ```
	 */
	name: string,

	images: {
		// In Xcode, it generates "appearances" with array value, even the image is only one appearance variant per image.
		appearances?: Appearances,
		// We cannot find "color-space" option in Xcode imageset inspector
		// "color-space"?: ColorSpace,
		"compression-type"?: CompressionType,
		"display-gamut"?: DisplayGamut,
		/**
		 * @default "universal"
		 */
		idiom?: Idiom,
		languageDirection?: LanguageDirection,
		/**
		 * The filename in the path will be used as the filename property for the `Contents.json`.
		 * 
		 * The file itself supported for
		 * - .heif
		 * - .heic
		 * - .jpg
		 * - .jpeg
		 * - .png
		 */
		path: string,
		/**
		 * @default "1x"
		 */
		scale?: Scale,
	}[],

}
