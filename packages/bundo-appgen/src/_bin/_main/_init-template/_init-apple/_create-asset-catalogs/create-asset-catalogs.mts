import * as node_fs from "node:fs"
import * as node_path from "node:path"

import type {
	Config,
} from "../../../../../index.mts"

import {
	GlobalVars,
} from "../../../../_global-vars/index.mts"

import {
	ConfigHelpers,
} from "../../../_helpers/index.mts"

import {
	getXcassetsPath,
} from "./_get-xcassets-path.mts"

import {
	initAppiconsets,
} from "./_init-appiconsets.mts"

import {
	initImagesets,
} from "./_init-imagesets.mts"

export function createAssetCatalogs(
	assetCatalogs: Config.Apple.Data["assetCatalogs"],
	metadata: {
		bundleIdentifier: string,
		namespace?: string,
		platform: "macos",
	},
) {

	const
		xcassetsPath =
			getXcassetsPath(metadata.platform),

		assetCatalogsTrackerFilePath =
			ConfigHelpers.CachePaths.assetCatalogsTrackerFile()

	let catalogsTracker: CatalogsTrackerSchema = {
		appiconsets: undefined,
		imagesets: undefined,
	}

	function removeAllCatalogs() {
		// remove the Assets.xcassets directory including its files if any.
		if(node_fs.existsSync(xcassetsPath)) {
			node_fs.rmSync(
				xcassetsPath,
				{
					recursive: true,
					force: true,
				},
			)

			// restore the Contents.json inside of the Assets.xcassets
			node_fs.cpSync(
				node_path.join(
					GlobalVars.appgenRoot.get(),
					"template",
					metadata.platform,
					"HelloWorld",
					"Assets.xcassets",
				),
				xcassetsPath,
				{
					recursive: true,
					force: true,
				},
			)
		}

		if(node_fs.existsSync(assetCatalogsTrackerFilePath)) {
			node_fs.rmSync(assetCatalogsTrackerFilePath)
		}
	}

	if(!assetCatalogs) {
		removeAllCatalogs()
		return
	}

	try {
		if(node_fs.existsSync(assetCatalogsTrackerFilePath)) {
			catalogsTracker = JSON.parse(
				node_fs.readFileSync(assetCatalogsTrackerFilePath, "utf8"),
			) as CatalogsTrackerSchema
		}
	} catch {
		// the tracker file is not a valid JSON file
		// remove the Assets.xcassets directory including its files if any.
		removeAllCatalogs()
	}

	// +++++ Create Catalog Files +++++
	const newCatalogsTracker = createCatalogs(
		assetCatalogs,
		{
			bundleIdentifier: metadata.bundleIdentifier,
			platform: metadata.platform,
			namespace: metadata.namespace,
		},
	)
	// ----- Create Catalog Files -----

	catalogsTracker.appiconsets?.forEach(existingCatalog => {
		if(newCatalogsTracker.appiconsets?.indexOf(existingCatalog) === -1) {
			const existingPath = node_path.join(xcassetsPath, existingCatalog + ".appiconset")

			if(node_fs.existsSync(existingPath)) {
				node_fs.rmSync(
					existingPath,
					{
						recursive: true,
						force: true,
					},
				)
			}
		}
	})

	catalogsTracker.imagesets?.forEach(existingCatalog => {
		if(newCatalogsTracker.imagesets?.indexOf(existingCatalog) === -1) {
			/**
			 * "Long/Ass/Namespace/Image" -> "Long"
			 */
			const existingCatalogBasename = existingCatalog.split("/")[0]

			if(!existingCatalogBasename) {
				return
			}

			const existingPath = node_path.join(
				xcassetsPath,
				existingCatalogBasename,
			)

			if(node_fs.existsSync(existingPath)) {
				// remove namespace directory
				node_fs.rmSync(
					existingPath,
					{
						recursive: true,
						force: true,
					},
				)
			} else {
				const imagesetDir = node_path.join(existingCatalogBasename, ".imageset")
				if(node_fs.existsSync(imagesetDir)) {
					node_fs.rmSync(
						imagesetDir,
						{
							recursive: true,
							force: true,
						},
					)
				}
			}
		}
	})

	node_fs.writeFileSync(
		assetCatalogsTrackerFilePath,
		JSON.stringify(newCatalogsTracker, null, 2),
		"utf8",
	)
}

function createCatalogs(
	assetCatalogs: NonNullable<Config.Apple.Data["assetCatalogs"]>,
	metadata: {
		bundleIdentifier: string,
		namespace?: string,
		platform: "macos",
	},
	nextTracker?: CatalogsTrackerSchema,
): CatalogsTrackerSchema {

	const tracker: CatalogsTrackerSchema = nextTracker ?? {
		appiconsets: undefined,
		imagesets: undefined,
	}

	if(!assetCatalogs) {
		return tracker
	}

	let isRecursived = false

	for(const _key of Object.keys(assetCatalogs)) {
		const key = _key as keyof typeof assetCatalogs

		if(key == "imagesets") {
			const trackedCatalogs = initImagesets(
				assetCatalogs.imagesets,
				metadata,
			)

			if(trackedCatalogs?.length) {
				if(!tracker.imagesets?.length) {
					tracker.imagesets = trackedCatalogs
				} else {
					tracker.imagesets = [
						...tracker.imagesets,
						...trackedCatalogs,
					]
				}
			}
		} else if(key == "appiconsets") {
			if(!isRecursived) {
				// appiconset cannot be created under a namespace

				const trackedCatalogs = initAppiconsets(
					assetCatalogs.appiconsets,
					metadata,
				)

				if(trackedCatalogs?.length) {
					if(!tracker.appiconsets?.length) {
						tracker.appiconsets = trackedCatalogs
					} else {
						tracker.appiconsets = [
							...tracker.appiconsets,
							...trackedCatalogs,
						]
					}
				}
			}
		} else {
			// key is namespace
			const namespacedCatalogs = assetCatalogs[key] as unknown as Config.Apple.AssetCatalogs

			if(namespacedCatalogs && Object.keys(namespacedCatalogs).length) {
				isRecursived = true

				createCatalogs(
					namespacedCatalogs,
					{
						...metadata,
						namespace: metadata.namespace ? `${metadata.namespace}/${key as string}` : key,
					},
					tracker,
				)
			}
		}
	}

	return tracker

}

interface CatalogsTrackerSchema {
	appiconsets: string[] | undefined,
	imagesets: string[] | undefined,
}
