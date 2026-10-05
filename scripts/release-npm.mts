#!/usr/bin/env node

import * as node_childProcess from "node:child_process"
import * as node_fs from "node:fs"
import * as node_path from "node:path"

import SemverPrerelease from "semver/functions/prerelease.js"
import SemverValid from "semver/functions/valid.js"

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
					demandOption: "Please specify the tag of package to publish. For example \"v2.0\", or \"the-package-name@1.2.3\"",
				},
			})
			.parseSync()

if(argv.tag.startsWith("v")) {
	// bundo.rn
	// Bundle and publish all packages

	const packages = [
		"bundo-appgen", // bundo-appgen has to be the first package
		"bundo.rn",
		"bundo-window",
	]

	for(const pkg of packages) {
		const
			packageDir =
				node_path.join(rootDir, "packages", pkg),

			packageJson =
				JSON.parse(
					node_fs.readFileSync(
						node_path.join(packageDir, "package.json"),
						"utf8",
					),
				) as typeof import("../package.json") // just for the schema/definition

		// check if the version from the tag is same from the packageJson.version
		if(`v${packageJson.version}` !== argv.tag) {
			throw new Error(`Cannot publish ${pkg} v${packageJson.version}, while using GIT tag ${argv.tag}.`)
		}

		// build and create the tarball file
		node_childProcess.execSync(
			packageJson.name == "bundo.rn"
				? "bun run build --skip-build-bundo-appgen && bun pm pack"
				: "bun run build && bun pm pack",
			{
				cwd: packageDir,
				stdio: "inherit",
			},
		)

		let publishCommand =
			"bunx npm publish"
				+ ` ./${pkg}-${packageJson.version}.tgz`
				+ " --access public"

		const prereleaseTag = SemverPrerelease(argv.tag)
		if(typeof prereleaseTag?.[0] == "string") {
			publishCommand += ` --tag ${prereleaseTag[0]}`
		}

		node_childProcess.execSync(
			publishCommand,
			{
				cwd: packageDir,
				stdio: "inherit",
			},
		)
	}

} else {

	const matchedTag = argv.tag.match(/(.*)@(.*)/)
	if(
		!matchedTag?.[1] ||
		!matchedTag?.[2] ||
		!SemverValid(matchedTag[2])
	) {
		throw new Error("Cannot extract the package name and the version from the tag. The tag format must be \"the-package-name@1.2.3\".")
	}

	const
		packageName =
			matchedTag[1],

		/**
		 * The semver without the leading "v"
		 * @example "0.0.1-beta.4"
		 */
		version =
			matchedTag[2],

		packageDir =
			node_path.join(rootDir, "packages", packageName),

		packageJson =
			JSON.parse(
				node_fs.readFileSync(
					node_path.join(packageDir, "package.json"),
					"utf8",
				),
			) as typeof import("../package.json") // just for the schema/definition

	if(!node_fs.existsSync(packageDir)) {
		throw new Error(`${packageName} was not found in the packages.`)
	}

	if(packageJson.version !== version) {
		throw new Error(`Cannot publish ${packageName}@${packageJson.version}, while using GIT tag ${argv.tag}.`)
	}

	// build and create the tarball file
	node_childProcess.execSync(
		"bun run build && bun pm pack",
		{
			cwd: packageDir,
			stdio: "inherit",
		},
	)

	let publishCommand =
		"bunx npm publish"
			+ ` ./${packageName}-${packageJson.version}.tgz`
			+ " --access public"

	const prereleaseTag = SemverPrerelease(version)
	if(typeof prereleaseTag?.[0] == "string") {
		publishCommand += ` --tag ${prereleaseTag[0]}`
	}

	node_childProcess.execSync(
		publishCommand,
		{
			cwd: packageDir,
			stdio: "inherit",
		},
	)

}
