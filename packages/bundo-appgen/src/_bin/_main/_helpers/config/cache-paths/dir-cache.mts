import * as node_fs from "node:fs"
import * as node_path from "node:path"

import {
	GlobalVars,
} from "../../../../_global-vars/index.mts"

export function dirCache() {
	const path = node_path.join(
		node_path.dirname(GlobalVars.configFilePath.get()),
		".bundo.rn",
	)

	if(!node_fs.existsSync(path)) {
		node_fs.mkdirSync(path)
	}

	return path
}
