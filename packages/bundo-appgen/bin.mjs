#!/usr/bin/env node

const
	isBun =
		typeof Bun !== "undefined"

if(isBun) {
	// The ./src/bin/bin.mts is not using an actual Bun specific APIs.
	// This specific condition allows user with Bun runtime and with --bun flag
	// to run the source TypeScript files, such as
	// `bunx --bun bundo appgen` or
	// `bunx --bun bundo-appgen`

	console.log("> Using bundo-appgen TypeScript source files with Bun 🧄")
	require("./src/_bin/bin.mts").bin(import.meta.dirname)
} else {
	// @ts-expect-error Use transpiled file
	import("./lib/bin/bin.mjs").then(module => {
		module.bin(import.meta.dirname)
	})
}
