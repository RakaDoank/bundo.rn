import * as node_fs from "node:fs"
import * as node_path from "node:path"

import type {
	Config,
} from "../../../../index.mts"

import {
	GlobalVars,
} from "../../../_global-vars/index.mts"

/**
 * This function is probably better at inside of ./_bin/_main/_init-template/_init-apple,
 * but create-project-spec.mts needs the directory name as the "subpath" resource configuration.
 */
export function initResources(
	resources: Config.Apple.Data["resources"],
	metadata: {
		platform: "macos" | "ios",
	},
): {
	basenameFiles: string[],
	subpaths: string[],
} | null {

	if(!resources?.length) {
		return null
	}

	const
		projectDirectory =
			node_path.dirname(
				GlobalVars.configFilePath.get(),
			),

		resourcesDirectory =
			node_path.join(
				projectDirectory,
				metadata.platform,
				"Resources",
			),

		basenameFiles: NonNullable<ReturnType<typeof initResources>>["basenameFiles"] =
			[],

		subpaths: NonNullable<ReturnType<typeof initResources>>["subpaths"] =
			[]

	node_fs.rmSync(resourcesDirectory, { recursive: true, force: true })
	node_fs.mkdirSync(resourcesDirectory)

	try {
		for(const resource of resources) {
			let path = node_path.resolve(projectDirectory, resource)

			if(!node_fs.existsSync(path)) {
				throw new Error(`The ${path} was not found.`)
			}

			const lstat = node_fs.lstatSync(path)

			if(lstat.isSymbolicLink()) {
				path = node_fs.realpathSync(path)
			}

			console.log(`\x1b[32mCopying resource\x1b[0m \x1b[36m${path}\x1b[0m`)

			node_fs.cpSync(
				path,
				node_path.join(
					resourcesDirectory,
					node_path.basename(path),
				),
				{
					recursive: true,
					force: true,
				},
			)

			if(lstat.isDirectory()) {
				subpaths.push(node_path.basename(path))
			} else {
				basenameFiles.push(node_path.basename(path))
			}
		}
	} catch(err) {
		// remove the resources directory upon error
		node_fs.rmSync(resourcesDirectory, { force: true, recursive: true })
		throw err
	}

	// return data
	return {
		basenameFiles,
		subpaths,
	}

}
