import * as node_childProcess from "node:child_process"
import * as node_fs from "node:fs"
import * as node_path from "node:path"
import * as node_util from "node:util"

const
	paths =
		(() => {
			const
				root =
					node_path.join(import.meta.dirname, ".."),

				plugin =
					node_path.join(root, "_plugin")

			return {
				root,
				lib: node_path.join(root, "lib"),
				plugin,
			}
		})(),

	childProcessExec =
		node_util.promisify(
			node_childProcess.exec,
		)

node_fs.rmSync(paths.lib, { recursive: true, force: true })

await Promise.all([

	// Bundle the plugin script
	Bun.build({
		entrypoints: [
			node_path.join(paths.plugin, "bundo.plugin.mts"),
		],
		external: [
			"bundo-appgen",
			"bundo.rn",
		],
		format: "esm",
		naming: "[name].mjs",
		outdir: paths.lib,
		target: "node",
		treeShaking: true,
	}),

	// Bob
	childProcessExec(
		`bunx bob build`,
		{
			cwd: paths.root,
		},
	),

	// Typescript
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
