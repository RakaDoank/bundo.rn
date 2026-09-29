#!/usr/bin/env node

import yargs from "yargs"
import * as YargsHelpers from "yargs/helpers"

yargs(YargsHelpers.hideBin(process.argv))
	.command(
		"appgen",
		"Bundo App Generator",
		__yargs => {
			// forward help to the bundo-appgen
			return __yargs.help(false)
		},
		() => {
			import("bundo-appgen/bin.mjs")
		},
	)
	.demandCommand(1)
	.parseSync()
