import * as node_fs from "node:fs"
import * as node_path from "node:path"

import BundoWindowPackageJson from "../../../../bundo-window/package.json" with { type: "json" }
import BundoRnPackageJson from "../../../../bundo.rn/package.json" with { type: "json" }

import {
	GlobalVars,
} from "../_global-vars/index.mts"

export async function initMonorepo() {

	const
		templatesDir =
			GlobalVars.templatesDir.get(),

		packageManager =
			GlobalVars.packageManager.get()

	if(
		packageManager != "bun" &&
		packageManager != "pnpm"
	) {
		// This check is already done with our prompt option (@inquirer/prompts).
		// User cannot use "npm" package manager for "macos+windows" platform
		return
	}

	node_fs.cpSync(
		node_path.join(templatesDir, "bundo-monorepo-project"),
		process.cwd(),
		{
			recursive: true,
			force: true,
		},
	)

	// $$eslint.config.mjs
	node_fs.renameSync(
		node_path.join(process.cwd(), "$$eslint.config.mjs"),
		node_path.join(process.cwd(), "eslint.config.mjs"),
	)

	// $$tsconfg.json
	{
		const tsconfigJsonPath = node_path.join(process.cwd(), "tsconfig.json")

		// rename $$tsconfig.json
		node_fs.renameSync(
			node_path.join(process.cwd(), "$$tsconfig.json"),
			tsconfigJsonPath,
		)

		// modify tsconfig.json
		const tsconfigJson = JSON.parse(
			node_fs.readFileSync(tsconfigJsonPath, "utf8"),
		) as {
			files: [],
			references: {
				path: string
			}[],
		}

		tsconfigJson.references.push(
			{ path: "./apps/macos-app" },
			{ path: "./apps/windows-app" },
			{ path: "./packages/app-ui" },
			{ path: "./tsconfig.node.json" },
		)

		node_fs.writeFileSync(
			tsconfigJsonPath,
			JSON.stringify(tsconfigJson, null, 2),
			"utf8",
		)
	}

	// $$.gitignore
	node_fs.renameSync(
		node_path.join(process.cwd(), "$$.gitignore"),
		node_path.join(process.cwd(), ".gitignore"),
	)

	// package.json
	// pnpm-workspace.yaml
	{
		const
			packageJsonPath =
				node_path.join(process.cwd(), "package.json"),

			packageJson =
				JSON.parse(
					node_fs.readFileSync(
						packageJsonPath,
						"utf8",
					),
				) as typeof import("../../../templates/bundo-monorepo-project/package.json"),

			bundoWindowVersion =
				await fetch(
					"https://registry.npmjs.org/bundo-window/latest",
				)
					.then(async res => {
						const json = await res.json() as {
							version: string,
						}
						if(json && typeof json === "object" && typeof json?.version === "string") {
							return json.version
						}
						throw new Error()
					})
					.catch(() => {
						return BundoWindowPackageJson.version
					}),

			bundoRnVersion =
				await fetch(
					"https://registry.npmjs.org/bundo.rn/latest",
				)
					.then(async res => {
						const json = await res.json() as {
							version: string,
						}
						if(json && typeof json === "object" && typeof json?.version === "string") {
							return json.version
						}
						throw new Error()
					})
					.catch(() => {
						return BundoRnPackageJson.version
					})

		if(packageManager == "bun") {
			// Bun

			node_fs.renameSync(
				node_path.join(process.cwd(), "$$bunfig.toml"),
				node_path.join(process.cwd(), "bunfig.toml"),
			)

			// remove the $$pnpm-workspace.yaml
			node_fs.rmSync(
				node_path.join(process.cwd(), "$$pnpm-workspace.yaml"),
				{
					force: true,
				},
			)

			// change these package catalog version in the package.json
			packageJson.workspaces.catalog["bundo-window"] = bundoWindowVersion
			packageJson.workspaces.catalog["bundo.rn"] = bundoRnVersion
		} else {
			// PNPM

			const pnpmWorkspacePath = node_path.join(process.cwd(), "pnpm-workspace.yaml")

			node_fs.renameSync(
				node_path.join(process.cwd(), "$$pnpm-workspace.yaml"),
				pnpmWorkspacePath,
			)

			// remove the bunfig.toml
			node_fs.rmSync(
				node_path.join(process.cwd(), "$$bunfig.toml"),
				{
					force: true,
				},
			)

			// @ts-expect-error remove the "workspaces" property in the package.json
			delete packageJson.workspaces

			// change these package catalog version in the pnpm-workspace.yaml
			let pnpmWorkspace = node_fs.readFileSync(pnpmWorkspacePath, "utf8")
			pnpmWorkspace = pnpmWorkspace
				.replace(
					"- 'bundo-window': $$",
					`- 'bundo-window': ~${bundoWindowVersion}`,
				)
				.replace(
					"- 'bundo.rn': $$",
					`- 'bundo.rn': ~${bundoRnVersion}`,
				)

			node_fs.writeFileSync(pnpmWorkspacePath, pnpmWorkspace, "utf8")
		}

		// rewrite it
		node_fs.writeFileSync(
			packageJsonPath,
			JSON.stringify(packageJson, null, 2),
			"utf8",
		)
	}

	// packages/app-ui/$$tsconfig.json
	node_fs.renameSync(
		node_path.join(process.cwd(), "packages", "app-ui", "$$tsconfig.json"),
		node_path.join(process.cwd(), "packages", "app-ui", "tsconfig.json"),
	)
}
