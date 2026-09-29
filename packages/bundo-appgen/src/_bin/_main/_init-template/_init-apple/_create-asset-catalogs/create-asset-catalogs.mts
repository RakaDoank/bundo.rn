import type {
	Config,
} from "../../../../../index.mts"

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
		platform: "macos" | "ios",
		projectName: string,
	},
) {
	if(!assetCatalogs) {
		return
	}

	for(const _key of Object.keys(assetCatalogs)) {
		const key = _key as keyof typeof assetCatalogs

		if(key == "imagesets") {
			initImagesets(
				assetCatalogs.imagesets,
				metadata,
			)
		} else if(key == "appiconsets") {
			initAppiconsets(
				assetCatalogs.appiconsets,
				metadata,
			)
		} else {
			// key is namespace
			const namespacedCatalogs = assetCatalogs[key] as unknown as Config.Apple.AssetCatalogs

			if(namespacedCatalogs && Object.keys(namespacedCatalogs).length) {
				createAssetCatalogs(
					namespacedCatalogs,
					{
						...metadata,
						namespace: key,
					},
				)
			}
		}
	}
}
