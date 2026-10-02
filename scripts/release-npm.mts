#!/usr/bin/env node

import * as node_childProcess from "node:child_process"
import * as node_fs from "node:fs"
import * as node_path from "node:path"

import SemverPrerelease from "semver/functions/prerelease.js"

import yargs from "yargs"
import * as YargsHelper from "yargs/helpers"

const
	rootDir =
		node_path.join(import.meta.dirname, ".."),

	argv =
		yargs(YargsHelper.hideBin(process.argv))
			.options({
				/**
				 * The tag is specified with the package name, but if the tag is started with "v",
				 * we assumed the tag is for the bundo.rn package
				 */
				"tag": {
					type: "string",
					description: "Specific tag of package to publish.",
					demandOption: "Please specify the tag of package to publish. For example \"v2.0\", or \"bundo-appgen@v1.2.3\"",
				},
			})
			.parseSync()

/**
 * Currently, we are using `npm` for publishing,
 * until bun support the --provenance https://github.com/oven-sh/bun/issues/15601
 */
let command = "bun run build && bunx npm publish --access public --provenance"

if(argv.tag.startsWith("v")) {
	// bundo.rn
	// Bundle and publish all packages

	const packages = [
		"bundo-appgen", // bundo-appgen has to be first package
		"bundo.rn",
		"bundo-window",
		"create-bundo-app",
	]

	for(const pkg of packages) {
		const prereleaseTag = SemverPrerelease(argv.tag)
		if(typeof prereleaseTag?.[0] == "string") {
			command += ` --tag ${prereleaseTag[0]}`
		}

		node_childProcess.execSync(
			command,
			{
				cwd: node_path.join(rootDir, "packages", pkg),
				stdio: "inherit",
			},
		)
	}

} else {

	// Specific package
	const packageName = argv.tag.replace(/@.*/, "")
	if(!packageName) {
		throw new Error("Cannot extract the package name from the tag. The tag format must be \"the-package-name@v1.2.3\".")
	}

	const packageDirectory = node_path.join(rootDir, "packages", packageName)
	if(!node_fs.existsSync(packageDirectory)) {
		throw new Error(`${packageName} was not found in the packages.`)
	}

	const prereleaseTag = SemverPrerelease(argv.tag)
	if(typeof prereleaseTag?.[0] == "string") {
		command += ` --tag ${prereleaseTag[0]}`
	}

	node_childProcess.execSync(
		command,
		{
			cwd: packageDirectory,
			stdio: "inherit",
		},
	)

}
