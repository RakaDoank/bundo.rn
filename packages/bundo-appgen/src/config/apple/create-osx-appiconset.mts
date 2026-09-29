import type * as AssetCatalogFormat from "./asset-catalog-format/index.ts"

/**
 * An helper to provide correct OS X app icon in the catalog.
 * You can provide a single image for 1024x1024 size in the `images` property.
 * However, if you want to customize your app’s icon variants, such as to show more or less detail at a specific size, you can provide individual assets for the variations.
 */
export function createOSXappiconset(
	data: {
		name: string,
		images: OSXappiconsetImages,
	},
) {

	return {
		name: data.name,
		images: [
			{
				path: data.images["16x16"] || data.images["1024x1024"],
				size: "16x16",
				idiom: "mac",
				scale: "1x",
			},

			{
				path: data.images["32x32"] || data.images["1024x1024"],
				size: "16x16",
				idiom: "mac",
				scale: "2x",
			},

			{
				path: data.images["32x32"] || data.images["1024x1024"],
				size: "32x32",
				idiom: "mac",
				scale: "1x",
			},

			{
				path: data.images["64x64"] || data.images["1024x1024"],
				size: "32x32",
				idiom: "mac",
				scale: "2x",
			},

			{
				path: data.images["128x128"] || data.images["1024x1024"],
				size: "128x128",
				idiom: "mac",
				scale: "1x",
			},

			{
				path: data.images["256x256"] || data.images["1024x1024"],
				size: "128x128",
				idiom: "mac",
				scale: "2x",
			},

			{
				path: data.images["256x256"] || data.images["1024x1024"],
				size: "256x256",
				idiom: "mac",
				scale: "1x",
			},

			{
				path: data.images["512x512"] || data.images["1024x1024"],
				size: "256x256",
				idiom: "mac",
				scale: "2x",
			},

			{
				path: data.images["512x512"] || data.images["1024x1024"],
				size: "512x512",
				idiom: "mac",
				scale: "1x",
			},

			// This is an actual valid metadata for App Store.
			{
				path: data.images["1024x1024"],
				size: "512x512",
				idiom: "mac",
				scale: "2x",
			},
		],
	} satisfies OSXappiconset

}

type OSXIconSize =
	| Extract<
		AssetCatalogFormat.AppIcon.Size,
		| "16x16"
		| "32x32"
		| "128x128"
		| "256x256"
		| "512x512"
		| "1024x1024"
	>
	| "64x64" // 2x scale - 32x32

type OSXappiconsetImagesRequired = {
	[Size in Extract<OSXIconSize, "1024x1024">]: string
}

type OSXappiconsetImages =
	& OSXappiconsetImagesRequired
	& Partial<{
		[Size in Exclude<OSXIconSize, "1024x1024">]: string
	}>

interface OSXappiconImageData<Size extends OSXIconSize, Scale extends Exclude<AssetCatalogFormat.Image.Scale, "3x">> extends Pick<AssetCatalogFormat.AppIcon.SetType["images"][0], "path"> {
	size: Size,
	idiom: "mac"
	scale: Scale,
}

interface OSXappiconset {
	name: string,
	images: [
		OSXappiconImageData<"16x16",	"1x">,
		OSXappiconImageData<"16x16",	"2x">,
		OSXappiconImageData<"32x32",	"1x">,
		OSXappiconImageData<"32x32",	"2x">,
		OSXappiconImageData<"128x128",	"1x">,
		OSXappiconImageData<"128x128",	"2x">,
		OSXappiconImageData<"256x256",	"1x">,
		OSXappiconImageData<"256x256",	"2x">,
		OSXappiconImageData<"512x512",	"1x">,
		OSXappiconImageData<"512x512",	"2x">, // App Store
	]
}
