import * as node_fs from "node:fs"
import * as node_path from "node:path"

import type {
	Config,
} from "../../../../../index.mts"

import {
	GlobalVars,
} from "../../../../_global-vars/index.mts"

import * as MetadataCheck from "./_metadata-check/index.mts"

/**
 * Similar as the _init-imagesets.mts
 */
export function initAppiconsets(
	appiconsets: Config.Apple.AssetCatalogs["appiconsets"],
	metadata: {
		bundleIdentifier: string,
		projectName: string,
		platform: "ios" | "macos",
	},
) {

	if(!appiconsets?.length) {
		return
	}

	const projectDirectory = node_path.dirname(GlobalVars.configFilePath.get())

	const targetDirectory = node_path.join(
		projectDirectory,
		"macos",
		metadata.projectName,
		"Assets.xcassets",
	)

	let appiconset_index = -1
	for(const appiconset of appiconsets) {
		if(!appiconset.images.length) {
			break
		}

		appiconset_index++

		// +++++ create <name>.appiconset directory inside of the target directory
		const _appiconset_directory = node_path.join(
			targetDirectory,
			`${appiconset.name}.appiconset`,
		)
		if(!node_fs.existsSync(_appiconset_directory)) {
			node_fs.mkdirSync(_appiconset_directory)
		}
		// -----

		// Intentionally commented the `existingImageFilenames`
		// At this moment, we are allowing use the same file for different variant

		// store a fast lookup of image filename
		// const existingImageFilenames: string[] = []

		const contentsJson: CatalogContentsJson = {
			images: [],
			info: {
				version: 1,
				author: metadata.bundleIdentifier,
			},
		}

		let image_index = -1
		for(const { path: imagePath, ...image } of appiconset.images) {
			image_index++

			const
				imageFilePath =
					node_path.resolve(projectDirectory, imagePath),

				imageMetadata: (typeof contentsJson.images)[0] =
					{
						appearances: image.appearances?.[0]
							? [{
								appearance: image.appearances[0].appearance,
								value: image.appearances[0].value,
							}]
							: undefined,
						"display-gamut": image["display-gamut"] || undefined,
						filename: node_path.basename(imageFilePath),
						size: image.size,
						idiom: image.idiom || "universal",
						scale: image.scale || "1x",
					}

			{
				const traceStr = `\`appiconsets[${appiconset_index}].images[${image_index}]\``

				if(!imagePath) {
					throw new Error(`Not a valid image path in the ${traceStr}.`)
				}

				if(
					image.appearances?.length &&
					!MetadataCheck.appearances(image.appearances)
				) {
					throw new Error(`Not a valid appearances in the ${traceStr}.`)
				}

				if(
					image["display-gamut"] &&
					!MetadataCheck.Image.displayGamut(image["display-gamut"])
				) {
					throw new Error(`Not a valid image "display-gamut" in the ${traceStr}.`)
				}

				if(!mapImageSize[image.size]) {
					throw new Error(`Not a valid image size in the ${traceStr}.`)
				}

				if(
					image["idiom"] &&
					!MetadataCheck.idiom(image.idiom)
				) {
					throw new Error(`Not a valid idiom in the ${traceStr}.`)
				}

				// throw Error if the image is not existed
				if(!node_fs.existsSync(imageFilePath)) {
					throw new Error(`Cannot find ${imagePath} relatively from your project directory.`)
				}

				// throw if the image extname is not supported by Xcode
				const imageExtname = node_path.extname(imageFilePath)
				if(imageExtname !== ".png") {
					throw new Error(`${imageExtname} file is not supported in Asset Catalogs.`)
				}

				// if(existingImageFilenames.indexOf(imageMetadata.filename) > -1) {
				// 	throw new Error("Cannot use the same image file for different variant.")
				// }

				// It has different filename,
				// but it is prohibited to use same variant
				if(contentsJson.images.length) {
					for(const existingImageMetadata of contentsJson.images) {
						/**
						 * Fix me.
						 * This is just a lazy comparison.
						 */
						const isSimilar =
							JSON.stringify(existingImageMetadata) ===
							JSON.stringify(imageMetadata)

						if(isSimilar) {
							throw new Error("Cannot use multiple images with same variant.")
						}
					}
				}
			}

			// Copy the image file
			// place it to the `Assets.xcassets/<namespace?>/<name>.imageset/<imageFilename>
			node_fs.copyFileSync(
				imageFilePath,
				node_path.join(_appiconset_directory, imageMetadata.filename),
			)

			// add the image data to the Contents.json
			contentsJson.images.push({ ...imageMetadata })

			// existingImageFilenames.push(imageMetadata.filename)
		}

		// Create Contents.json file inside of <name>.imageset directory
		node_fs.writeFileSync(
			node_path.join(_appiconset_directory, "Contents.json"),
			JSON.stringify(
				contentsJson,
				null,
				2,
			),
			"utf8",
		)
	}

}

/**
 * An actual Xcode Contents.json for an asset catalog
 */
interface CatalogContentsJson {
	images: (Omit<Config.Apple.AssetCatalogFormat.AppIcon.SetType["images"][0], "path"> & {
		filename: string,
	})[],
	info: {
		version: number,
		author: string,
	},
}

const
	/**
	 * This is just for a fast check if user input about the size is wrong
	 */
	mapImageSize: Record<Config.Apple.AssetCatalogFormat.AppIcon.Size, 1> =
		{
			"16x16": 1,
			"20x20": 1,
			"24x24": 1,
			"27.5x27.5": 1,
			"29x29": 1,
			"32x32": 1,
			"40x40": 1,
			"44x44": 1,
			"60x60": 1,
			"76x76": 1,
			"83.5x83.5": 1,
			"86x86": 1,
			"98x98": 1,
			"128x128": 1,
			"256x256": 1,
			"512x512": 1,
			"1024x1024": 1,
		}
