import * as node_fs from "node:fs"
import * as node_path from "node:path"

import * as Yaml from "yaml"

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
	{
		const
			eslintConfigTemplatePath =
				node_path.join(process.cwd(), "$$eslint.config.mjs"),

			eslintConfigPath =
				node_path.join(process.cwd(), "eslint.config.mjs")

		let eslintConfigFile = node_fs.readFileSync(eslintConfigTemplatePath, "utf8")

		const
			reactAndReactNativeFiles =
				"$1\"./apps/*/index.js\",\n"
				+ "$1\"./apps/*/src/**/*.{ts,tsx,js,jsx}\",\n"
				+ "$1\"./packages/*/src/**/*.{ts,tsx,js,jsx}\",",

			nodeFiles =
				"$1\"./apps/*/*.config.{js,mjs,ts,mts}\",\n"
				+ "$1\"./packages/*/scripts/*.{js,mjs,ts,mts}\",\n"
				+ "$1\"./scripts/**/*.{js,mjs,ts,mts}\","

		eslintConfigFile = eslintConfigFile
			.replace(
				/^(\s+)\/\/\s\$\$react_and_react_native_files/,
				reactAndReactNativeFiles,
			)
			.replace(
				/^(\s+)\/\/\s\$\$node_files/,
				nodeFiles,
			)

		node_fs.writeFileSync(
			eslintConfigPath,
			eslintConfigFile,
			"utf8",
		)

		node_fs.rmSync(
			eslintConfigTemplatePath,
			{ force: true },
		)
	}

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
			packageJson.workspaces.catalog["bundo-window"] = `~${bundoWindowVersion}`
			packageJson.workspaces.catalog["bundo.rn"] = `~${bundoRnVersion}`
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

			// Related changes in the pnpm-workspace.yaml
			// by borrowing some fields from the package.json (Bun)
			// - catalog
			// - packages

			const pnpmWorkspaceYaml = Yaml.parse(node_fs.readFileSync(pnpmWorkspacePath, "utf8")) as {
				catalog: Record<string, string>,
				packages: string[],
			}

			pnpmWorkspaceYaml.catalog = packageJson.workspaces.catalog
			pnpmWorkspaceYaml.catalog["bundo-window"] = `~${bundoWindowVersion}`
			pnpmWorkspaceYaml.catalog["bundo.rn"] = `~${bundoRnVersion}`

			pnpmWorkspaceYaml.packages = packageJson.workspaces.packages

			node_fs.writeFileSync(
				pnpmWorkspacePath,
				Yaml
					.stringify(
						pnpmWorkspaceYaml,
						{
							toStringDefaults: {
								singleQuote: true,
							},
						},
					)
					.replace(/(^\w+:.*)(?!\n\s\s)/gm, "$1\n")
					.replace(/(^\s+.*)(\n^\w+.*)/gm, "$1\n$2"),
				"utf8",
			)

			// @ts-expect-error remove the "workspaces" property in the package.json
			delete packageJson.workspaces
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
