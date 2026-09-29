import * as node_childProcess from "node:child_process"
import * as node_fs from "node:fs"
import * as node_path from "node:path"
import * as node_util from "node:util"

import {
	Glob,
} from "bun"

const
	paths =
		(() => {
			const
				root =
					node_path.join(import.meta.dirname, ".."),

				lib =
					node_path.join(root, "lib"),

				src =
					node_path.join(root, "src"),

				plugin =
					node_path.join(root, "_plugin")

			return {
				root,
				lib: {
					__dirname: lib,
					commonjs: node_path.join(lib, "commonjs"),
					module: node_path.join(lib, "module"),
					typescript: node_path.join(lib, "typescript"),
				},
				plugin,
				src,
			}
		})(),

	srcEntrypoints: string[] =
		[]

{
	const glob = new Glob("**/*.{ts,mts}")
	for await (
		const path of
		glob.scan({
			cwd: paths.src,
			absolute: true,
		})
	) {
		srcEntrypoints.push(path)
	}
}

node_fs.rmSync(paths.lib.__dirname, { recursive: true, force: true })

const childProcessExec = node_util.promisify(
	node_childProcess.exec,
)

await Promise.all([

	// +++++ Source Files +++++
	Bun.build({
		entrypoints: srcEntrypoints,
		external: [
			"bundo-appgen",
		],
		format: "cjs",
		naming: "[dir]/[name].[ext]",
		outdir: paths.lib.commonjs,
		target: "browser",
		treeShaking: true,
	}),

	Bun.build({
		entrypoints: srcEntrypoints,
		external: [
			"bundo-appgen",
		],
		format: "esm",
		naming: "[dir]/[name].[ext]",
		outdir: paths.lib.module,
		splitting: true,
		target: "browser",
		treeShaking: true,
	}),
	// ----- Source Files ------

	childProcessExec(
		"bunx tsc"
			+ " --project tsconfig.react-native.json"
			+ " --noEmit false"
			+ " --emitDeclarationOnly"
			+ " --declarationMap"
			+ " --outDir ./lib/typescript",
		{
			cwd: paths.root,
		},
	),
])
