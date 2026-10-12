import * as node_fs from "node:fs"
import * as node_path from "node:path"

import {
	GlobalVars,
} from "../../../../../_global-vars/index.mts"

export function podDependencies(
	platform: "macos",
) {

	const
		dependencies =
			GlobalVars.appConfig.get()[platform as "macos"]?.Podfile?.dependencies,

		nativeProjectDir =
			node_path.join(
				node_path.dirname(GlobalVars.configFilePath.get()),
				platform,
			)

	const podDependenciesFilePath = node_path.join(nativeProjectDir, "pod_dependencies.rb")

	let podDependenciesFile = "def pod_dependencies"

	dependencies?.forEach(dependency => {
		// start with a line break and 2 spaces
		let tx = `\n  pod '${dependency.name}'`

		if(dependency.type == "cocoapods") {
			if(dependency.version) {
				tx += `, '${dependency.version}'`
			}
		} else if(dependency.type == "git") {
			if(!dependency.url || typeof dependency.url != "string") {
				throw new Error("\"gitUrl\" is empty or not a valid string for a pod spec source.")
			}

			tx += `, :git => '${dependency.url}'`

			if(dependency.revision) {
				if(
					dependency.revision.type !== "branch" &&
					dependency.revision.type !== "commit" &&
					dependency.revision.type !== "tag"
				) {
					throw new Error("Expected \"branch\", or \"commit\", or \"tag\" for the revision type.")
				}

				if(
					typeof dependency.revision.ref != "string" ||
					!dependency.revision.ref
				) {
					throw new Error("Revision ref is empty or not a valid string.")
				}

				tx += `, :${dependency.revision.type} => '${dependency.revision.ref}'`
			}
		} else if(dependency.type == "local") {
			if(!dependency.path || typeof dependency.path != "string") {
				throw new Error("\"path\" is empty or not a valid string for a local pod.")
			}

			tx += `, :path => '${dependency.path}'`
		}

		podDependenciesFile += tx
	})

	podDependenciesFile += "\nend\n"

	node_fs.writeFileSync(
		podDependenciesFilePath,
		podDependenciesFile,
		"utf8",
	)

}
