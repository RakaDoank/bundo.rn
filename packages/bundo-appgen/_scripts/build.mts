import * as node_fs from "node:fs"
import * as node_path from "node:path"

import {
	Glob,
} from "bun"

const
	paths =
		(() => {
			const
				root =
					node_path.join(import.meta.dirname, ".."),

				src =
					node_path.join(root, "src"),

				lib =
					node_path.join(root, "lib")

			return {
				root,
				src: {
					__dirname: src,
					bin: node_path.join(src, "_bin"),
				},
				lib: {
					__dirname: lib,
					bin: node_path.join(lib, "bin"),
					commonjs: node_path.join(lib, "commonjs"),
					module: node_path.join(lib, "module"),
				},
			}
		})(),

	srcEntrypoints: string[] =
		[]

{
	const glob = new Glob("**/*.mts")
	for await (
		const path of
		glob.scan({
			cwd: paths.src.__dirname,
			absolute: true,
		})
	) {
		if(!path.includes("/_bin")) {
			srcEntrypoints.push(path)
		}
	}
}

node_fs.rmSync(paths.lib.bin, { recursive: true, force: true })
node_fs.rmSync(paths.lib.commonjs, { recursive: true, force: true })
node_fs.rmSync(paths.lib.module, { recursive: true, force: true })

await Promise.all([

	// Bundle the bin script
	Bun.build({
		entrypoints: [
			node_path.join(paths.src.bin, "bin.mts"),
			node_path.join(paths.src.bin, "plugin-sandbox-runner", "plugin-sandbox-runner.mts"),
		],
		external: [
			"semver",
			"tsx",
			"tsx/cjs",
			"typescript",
			"yargs",
			"yargs/helpers",
		],
		format: "esm",
		naming: "[name].mjs",
		outdir: paths.lib.bin,
		target: "node",
		treeShaking: true,
	}),

	// Bundle the source files - ESM
	Bun.build({
		entrypoints: srcEntrypoints,
		format: "esm",
		naming: "[dir]/[name].[ext]",
		outdir: paths.lib.module,
		splitting: true,
		target: "node",
		treeShaking: true,
	}),

	// Bundle the source files - CJS
	Bun.build({
		entrypoints: [
			node_path.join(paths.src.__dirname, "index.mts"),
		],
		format: "cjs",
		outdir: paths.lib.commonjs,
		target: "node",
	}),

])
