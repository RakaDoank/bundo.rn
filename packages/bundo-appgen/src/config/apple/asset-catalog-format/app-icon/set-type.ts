import type {
	Appearances,
} from "../appearances"

import type {
	Idiom,
} from "../idiom"

import type * as Image from "../image"

import type {
	Size,
} from "./size"

export interface SetType {

	name: string,

	images: {
		// In Xcode, it generates "appearances" with array value, even the image is only one appearance variant per image.
		appearances?: Appearances,
		"display-gamut"?: Image.DisplayGamut,
		/**
		 * @default "universal"
		 */
		idiom?: Idiom,
		/**
		 * The filename in the path will be used as the filename property for the `Contents.json`.
		 * Currently only support for PNG file.
		 */
		path: string,
		/**
		 * - 16x16 - An OS X icon
		 * - 20x20 - An iPhone or iPad notification icon
		 * - 24x24 - A 38mm Apple Watch notification center icon
		 * - 27.5x27.5 - A 42mm Apple Watch notification center icon
		 * - 29x29 -  An iPhone or iPad settings icon for iOS 7 or later. An Apple Watch companion settings icon
		 * - 32x32 - An OS X icon
		 * - 40x40 -  An iPhone or iPad Spotlight search results icon on iOS 7 or later. The main Apple Watch app icon.
		 * - 44x44 - An Apple Watch long-look notification icon
		 * - 60x60 - The main iPhone app icon for iOS 7 or later
		 * - 76x76 - The main iPad app icon for iOS 7 or later
		 * - 83.5x83.5 - The main iPad Pro app icon
		 * - 86x86 - A 38mm Apple Watch short-look notification icon
		 * - 98x98 - A 42mm Apple Watch short-look notification icon
		 * - 128x128 - An OS X icon
		 * - 256x256 - An OS X icon
		 * - 512x512 - An OS X icon
		 * - 1024x1024 - The App Store icon
		 */
		size: Size,

		// Even though from this documentation https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/AppIconType.html
		// states that `appiconset` has `scale`, but I never find it in Xcode inspector.
		// However, Xcode still generate the Contents.json with scale property.
		scale?: Exclude<Image.Scale, "3x">
	}[],

}
