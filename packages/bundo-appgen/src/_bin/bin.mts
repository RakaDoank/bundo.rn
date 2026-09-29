#!/usr/bin/env node

import yargs from "yargs"
import * as YargsHelper from "yargs/helpers"

import {
	GlobalVars,
} from "./_global-vars/index.mts"

import {
	main,
} from "./_main/index.mts"

/**
 * @param bundoAppgenRoot We need the `bundoAppgenRoot` as file path to get the templates files.
 */
export async function bin(
	bundoAppgenRoot: string,
) {

	GlobalVars.appgenRoot.set(bundoAppgenRoot)

	try {
		const
			argv =
				yargs(YargsHelper.hideBin(process.argv))
					.options({
						"clean": {
							type: "boolean",
							description: "Perform clean app generation.",
						},
						"force-cross-platform": {
							type: "boolean",
							description: "Experimentally force the script to init native app in non compatible OS.",
						},
						"path": {
							alias: "p",
							type: "string",
							description: "Use specific configuration file target.",
						},
						"xcodegen-path": {
							type: "string",
							description: "Use specific XcodeGen binary.",
						},
					})
					.parseSync()

		GlobalVars.argv.set({
			clean: !!argv.clean,
			forceCrossPlatform: !!argv["force-cross-platform"],
			path: argv.path || "",
			xcodegenPath: argv["xcodegen-path"] || "xcodegen",
		})

		await main()
	} catch(err) {
		if(err instanceof Error && err.message) {
			console.error(
				"\x1b[31mError\x1b[0m: " +
				err.message,
			)
			process.exitCode = 1
		} else {
			console.error("Unknown error. Please report it to https://github.com/RakaDoank/bundo.rn", { cause: err })
			process.exitCode = 1
		}
	}
}
