import * as node_fs from "node:fs"
import * as node_path from "node:path"

import SemverMajor from "semver/functions/major.js"
import SemverMinor from "semver/functions/minor.js"
import SemverSatisfies from "semver/functions/satisfies.js"
import SemverValid from "semver/functions/valid.js"

import BundoAppgenPackageJson from "../../packages/bundo-appgen/package.json" with { type: "json" }
import BundoRnPackageJson from "../../packages/bundo.rn/package.json" with { type: "json" }

/**
 * @param {string} tag Specific the tag of package to publish. For example "v2.0", or "the-package-name@1.2.3"
 */
export function getPackagesFromGitTagRelease(
	tag: string,
	meta: {
		rootDir: string,
	},
): {
	name: string,
	version: string,
	dirname: string,
}[] {

	if(tag.startsWith("v")) {
		// Bundle and publish all packages

		const packages = [
			"bundo-appgen", // bundo-appgen has to be the first package before bundo.rn
			"bundo.rn",
			"bundo-window",
			// do not put "create-bundo-app" here
		]

		const result: ReturnType<typeof getPackagesFromGitTagRelease> = []

		for(const pkg of packages) {
			const
				packageDir =
					node_path.join(meta.rootDir, "packages", pkg),

				packageJson =
					JSON.parse(
						node_fs.readFileSync(
							node_path.join(packageDir, "package.json"),
							"utf8",
						),
					) as typeof import("../../package.json") // assertion just for a schema/definition

			// All packages version should be the same with the tag
			// except the "create-bundo-app"

			if(`v${packageJson.version}` != tag) {
				throw new Error(`Cannot publish ${pkg} v${packageJson.version}, while using GIT tag ${tag}.`)
			}

			const isSemverSatisfied = isPackageSemverTildeSatisfied(packageJson.name, packageJson.version)

			if(!isSemverSatisfied) {
				throw new Error(
					`${packageJson.name} ${packageJson.version} is not satisfied with core package semver.`,
				)
			}

			result.push({
				name: packageJson.name,
				version: packageJson.version,
				dirname: packageDir,
			})
		}

		return result
	} // tag.startsWith("v")

	const matchedTag = tag.match(/(.*)@(.*)/)
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
			node_path.join(meta.rootDir, "packages", packageName)

	if(!node_fs.existsSync(packageDir)) {
		throw new Error(`${packageName} was not found in the packages.`)
	}

	const packageJson = JSON.parse(
		node_fs.readFileSync(
			node_path.join(packageDir, "package.json"),
			"utf8",
		),
	) as typeof import("../../package.json") // assertion just for a schema/definition

	if(packageJson.version !== version) {
		throw new Error(`Cannot publish ${packageName}@${packageJson.version}, while using GIT tag ${tag}.`)
	}

	const isSemverSatisfied = isPackageSemverTildeSatisfied(packageJson.name, packageJson.version)

	if(!isSemverSatisfied) {
		throw new Error(
			`${packageName}@${packageJson.version} was not satisfied with core package semver.`,
		)
	}

	return [{
		name: packageJson.name,
		version: packageJson.version,
		dirname: packageDir,
	}]

}

/**
 * Check if the specific package version is satisfied with tilde of bundo.rn version.
 * We do want to publish a specific package that greater version than bundo.rn "major.minor" version.
 * If the specific tag is "bundo.rn", we compare it to the bundo-appgen
 */
function isPackageSemverTildeSatisfied(
	name: string,
	version: string,
) {

	if(name == "create-bundo-app") {
		// "create-bundo-app" just a simple CLI package to create a bundo app files from scratch.
		// It does not depends from the core package internally.
		return true
	}

	const corePackageSemver = name == "bundo.rn"
		? BundoAppgenPackageJson.version
		: BundoRnPackageJson.version

	/**
	 * `0.1.2` -> `~0.1`
	 * 
	 * We are allowing a package version with greater or lower patch version than the core package.
	 */
	const corePackageSemverRange = `~${SemverMajor(corePackageSemver)}.${SemverMinor(corePackageSemver)}`

	return SemverSatisfies(
		version,
		corePackageSemverRange,
	)

}
