import * as node_fs from "node:fs"
import * as node_path from "node:path"

import {
	GlobalVars,
} from "../_global-vars/index.mts"

export function initMonorepo() {

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

	if(packageManager == "bun") {
		// Client wants to use Bun package manager
		// remove the pnpm-workspace.yaml
		node_fs.rmSync(
			node_path.join(process.cwd(), "pnpm-workspace.yaml"),
			{
				force: true,
			},
		)
	} else {
		// Client wants to use pnpm
		// remove the bunfig.toml
		node_fs.rmSync(
			node_path.join(process.cwd(), "bunfig.toml"),
			{
				force: true,
			},
		)
	}

	// packages/app-ui/$$tsconfig.json
	node_fs.renameSync(
		node_path.join(process.cwd(), "packages", "app-ui", "$$tsconfig.json"),
		node_path.join(process.cwd(), "packages", "app-ui", "tsconfig.json"),
	)
}
