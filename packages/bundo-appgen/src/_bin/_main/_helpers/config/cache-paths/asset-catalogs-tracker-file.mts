import * as node_path from "node:path"

import {
	dirCache,
} from "./dir-cache.mts"

export function assetCatalogsTrackerFile() {
	return node_path.join(dirCache(), "asset-catalogs.json")
}
