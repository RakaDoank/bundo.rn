import * as node_fs from "node:fs"
import * as node_path from "node:path"

import {
	GlobalVars,
} from "../../_global-vars/index.mts"

import {
	initApple,
} from "./_init-apple/index.mts"

export function initTemplate() {
	// config object is already checked at ../main.mts

	try {
		if(process.platform == "darwin") {
			initApple("macos")
		} else if(process.platform == "win32") {
			// TODO windows
		} else {
			// cross platform
			initApple("macos")
		}
	} catch(err) {
		// Delete the project templated directory
		const
			projectDirectory =
				node_path.dirname(GlobalVars.configFilePath.get()),

			projectMacosDir =
				node_path.join(projectDirectory, "macos")

		if(node_fs.existsSync(projectMacosDir)) {
			node_fs.rmSync(projectMacosDir, { recursive: true, force: true })
		}

		throw err
	}
}
