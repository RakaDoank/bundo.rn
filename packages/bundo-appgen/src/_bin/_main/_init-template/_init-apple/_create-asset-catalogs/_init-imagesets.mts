import * as node_fs from "node:fs"
import * as node_path from "node:path"

import type {
	Config,
} from "../../../../../index.mts"

import {
	GlobalVars,
} from "../../../../_global-vars/index.mts"

import * as MetadataCheck from "./_metadata-check/index.mts"

export function initImagesets(
	imagesets: Config.Apple.AssetCatalogs["imagesets"],
	metadata: {
		bundleIdentifier: string,
		namespace?: string,
		projectName: string,
	},
) {

	if(!imagesets?.length) {
		return
	}

	const projectDirectory = node_path.dirname(GlobalVars.configFilePath.get())

	let targetDirectory = node_path.join(
		projectDirectory,
		"macos",
		metadata.projectName,
		"Assets.xcassets",
	)

	if(metadata.namespace) {
		// append a namespace directory after Assets.xcassets
		targetDirectory = node_path.join(targetDirectory, metadata.namespace)

		// Create a namespace directory inside of "Assets.xcassets"
		node_fs.mkdirSync(
			targetDirectory,
			{
				recursive: true,
			},
		)

		// create Contents.json in the namespace directory
		node_fs.writeFileSync(
			node_path.join(targetDirectory, "Contents.json"),
			JSON.stringify({
				info: {
					version: 1,
					author: metadata.bundleIdentifier,
				},
				properties: {
					"provides-namespace": true,
				},
			}, null, 2),
			"utf8",
		)
	}

	let imageset_index = -1
	for(const imageset of imagesets) {
		if(!imageset.images.length) {
			break
		}

		imageset_index++

		// +++++ create <name>.imageset directory inside of the target directory
		const _imageset_directory = node_path.join(
			targetDirectory,
			`${imageset.name}.imageset`,
		)
		if(!node_fs.existsSync(_imageset_directory)) {
			node_fs.mkdirSync(_imageset_directory)
		}
		// -----

		// store a fast lookup of image filename
		const existingImageFilenames: string[] = []

		const contentsJson: CatalogContentsJson = {
			images: [],
			info: {
				version: 1,
				author: metadata.bundleIdentifier,
			},
		}

		let image_index = -1
		for(const { path: imagePath, ...image } of imageset.images) {
			image_index++

			if(
				!imagePath
			) {
				throw new Error("Not a valid image metadata object in the `imagesets[number].images[number]`")
			}

			const
				imageFilePath =
					node_path.resolve(projectDirectory, imagePath),

				imageMetadata: (typeof contentsJson.images)[0] =
					{
						appearances: image.appearances?.[0]
							// intentional for comparison with JSON.stringify
							? [{
								appearance: image.appearances[0].appearance,
								value: image.appearances[0].value,
							}]
							: undefined,
						"compression-type": image["compression-type"] || undefined,
						"display-gamut": image["display-gamut"] || undefined,
						filename: node_path.basename(imageFilePath),
						idiom: image.idiom || "universal",
						languageDirection: image.languageDirection,
						scale: image.scale || "1x",
					}

			{
				const traceStr = `\`appiconsets[${imageset_index}].images[${image_index}]\``

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
					image["compression-type"] &&
					!MetadataCheck.Image.compressionType(image["compression-type"])
				) {
					throw new Error(`Not a valid image compression-type in the ${traceStr}.`)
				}

				if(
					image["display-gamut"] &&
					!MetadataCheck.Image.displayGamut(image["display-gamut"])
				) {
					throw new Error(`Not a valid image "display-gamut" in the ${traceStr}.`)
				}

				if(
					image["idiom"] &&
					!MetadataCheck.idiom(image.idiom)
				) {
					throw new Error(`Not a valid idiom in the ${traceStr}.`)
				}

				if(
					image.languageDirection &&
					!MetadataCheck.Image.languageDirection(image.languageDirection)
				) {
					throw new Error(`Not a valid image language direction in the ${traceStr}.`)
				}

				// throw Error if the image is not existed
				if(!node_fs.existsSync(imageFilePath)) {
					throw new Error(`Cannot find ${imagePath} relatively from your project directory.`)
				}

				// throw if the image extname is not supported by Xcode
				const imageExtname = node_path.extname(imageFilePath)
				if(supportedImageExts.indexOf(imageExtname) == -1) {
					throw new Error(`${imageExtname} file is not supported in Asset Catalogs.`)
				}

				if(existingImageFilenames.indexOf(imageMetadata.filename) > -1) {
					throw new Error("Cannot use the same image file for different variant.")
				}

				// It has different filename,
				// but it is prohibited to use same variant
				if(contentsJson.images.length) {
					for(const existingImageMetadata of contentsJson.images) {
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
				node_path.join(_imageset_directory, imageMetadata.filename),
			)

			// add the image data to the Contents.json
			contentsJson.images.push({ ...imageMetadata })
		}

		// Create Contents.json file inside of <name>.imageset directory
		node_fs.writeFileSync(
			node_path.join(_imageset_directory, "Contents.json"),
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
	images: (Omit<Config.Apple.AssetCatalogFormat.Image.SetType["images"][0], "path"> & {
		filename: string,
	})[],
	info: {
		version: number,
		author: string,
	},
}

const supportedImageExts = [
	".heic",
	".heif",
	".jpg",
	".jpeg",
	".png",
]
