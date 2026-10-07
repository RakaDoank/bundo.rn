import * as node_childProcess from "node:child_process"
import * as node_fs from "node:fs"
import * as node_path from "node:path"

/**
 * @returns {string} String of the tgz file name.
 */
export function packPackage(
	data: {
		rootDir: string,
		packageName: string,
		/**
		 * Package semver string without the leading "v"
		 * @example "0.0.1-beta.1"
		 */
		packageVersion: string,
	},
): string {

	if(data.packageVersion.startsWith("v")) {
		throw new Error("Cannot use package semver with the leading \"v\".")
	}

	const packageDir = node_path.join(data.rootDir, "packages", data.packageName)

	// copy the LICENSE from the root
	node_fs.cpSync(
		node_path.join(data.rootDir, "LICENSE"),
		node_path.join(packageDir, "LICENSE"),
	)

	// pack the package
	node_childProcess.execSync(
		"bun pm pack",
		{
			cwd: packageDir,
			stdio: "inherit",
		},
	)

	return `${data.packageName}-${data.packageVersion}.tgz`

}
