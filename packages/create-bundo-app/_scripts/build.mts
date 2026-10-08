#!/usr/bin/env bun

import * as node_path from "node:path"

const
	paths =
		{
			lib: node_path.join(import.meta.dirname, "..", "lib"),
			src: node_path.join(import.meta.dirname, "..", "src"),
		}

await Bun.build({
	entrypoints: [
		node_path.join(paths.src, "bin.mts"),
	],
	format: "esm",
	naming: "[name].mjs",
	outdir: paths.lib,
	target: "node",
	treeShaking: true,
})
