import * as node_path from "node:path"

import {
	dirCache,
} from "./dir-cache.mts"

export function stringCatalogsTrackerFile() {
	return node_path.join(dirCache(), "string-catalogs.json")
}
