#!/usr/bin/env node

import yargs from "yargs"
import * as YargsHelpers from "yargs/helpers"

import {
	execPlugins,
} from "./_exec-plugins.mts"

import type {
	ArgvJSON,
} from "./argv-json.ts"

// Please, only allow permission in this script for

// - File System read for:
// 		- <projectDirectory>/macos/<projectName>/AppDelegate.swift
// 		- <projectDirectory>/macos/Podfile

try {

	const
		argv =
			yargs(YargsHelpers.hideBin(process.argv))
				.options({
					"json": {
						type: "string",
						description: "See bundo-appgen/src/_bin/plugin-sandbox-runner/_argv-json.ts",
					},
				})
				.parseSync(),

		argvJSON =
			JSON.parse(argv.json || "") as unknown as ArgvJSON

	if(!argvJSON.evaluatedPluginRegistry?.length) {
		// we already do a preventing to exec this plugin-sandbox-runner.mts
		// if plugin registry is empty.
		// Just in case, if we don't.
		throw new Error("Not a valid Evaluated Plugin Registry array.")
	}

	const result = await execPlugins({
		projectDirectory: argvJSON.projectDirectory,
		projectName: argvJSON.projectName,
		registry: argvJSON.evaluatedPluginRegistry,
	})

	// send message through IPC channel
	process.send?.(
		JSON.stringify({
			...result,
			messageID: argvJSON.messageID,
		}),
	)

} catch(err) {
	if(err instanceof Error && err.message) {
		console.error(
			"\x1b[31mPlugin Sandbox Runner Error\x1b[0m: " +
			err.message,
		)
		process.exitCode = 1
	} else {
		console.error("Unknown error. Please report it to https://github.com/RakaDoank/bundo.rn", { cause: err })
		process.exitCode = 1
	}
}
