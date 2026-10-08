#!/usr/bin/env bun

import * as node_childProcess from "node:child_process"
import * as node_path from "node:path"

import SemverPrerelease from "semver/functions/prerelease.js"

import yargs from "yargs"
import * as YargsHelper from "yargs/helpers"

import {
	getPackagesFromGitTagRelease,
} from "./_get-packages-from-git-tag-release.mts"

import {
	packPackage,
} from "./_pack-package.mts"

const
	rootDir =
		node_path.join(import.meta.dirname, "..", ".."),

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


// It is intentionally O(2) with an internal for-loop in `getPackagesFromGitTagRelease` and below for-loop.
// We have to check all the packages semver validation before to publish all the packages.
const packages = getPackagesFromGitTagRelease(
	argv.tag,
	{
		rootDir,
	},
)

for(const pkg of packages) {
	// build and create the tarball file

	if(
		pkg.name == "bundo.rn" &&
		packages.length > 1
	) {
		// bundo.rn needs "bundo-appgen" has to be built first,
		// but if the packages.length more than one or tag starts with "v",
		// we can skip the "bundo-appgen" build.
		node_childProcess.execSync(
			"bun run build --skip-build-bundo-appgen",
			{
				cwd: pkg.dirname,
				stdio: "inherit",
			},
		)
	} else {
		node_childProcess.execSync(
			"bun run build",
			{
				cwd: pkg.dirname,
				stdio: "inherit",
			},
		)
	}

	const tarballFilename = packPackage({
		rootDir,
		packageName: pkg.name,
		packageVersion: pkg.version,
	})

	let publishCommand =
		"bunx npm publish"
			+ ` ./${tarballFilename}`
			+ " --access public"

	const prereleaseTag = SemverPrerelease(pkg.version)
	if(typeof prereleaseTag?.[0] == "string") {
		publishCommand += ` --tag ${prereleaseTag[0]}`
	}

	node_childProcess.execSync(
		publishCommand,
		{
			cwd: pkg.dirname,
			stdio: "inherit",
		},
	)
}
