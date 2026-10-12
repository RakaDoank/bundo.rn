import type {
	AssetCatalogs,
} from "./asset-catalogs"

export type AssetCatalogsNamespaced =
	& AssetCatalogs
	& {
		/**
		 * Stated by Xcode
		 * "The app icon set must be a top level object in the asset."
		 */
		[Namespace: Exclude<string, keyof AssetCatalogs>]: Omit<AssetCatalogs, "appiconsets"> | AssetCatalogsNamespaced
	}
