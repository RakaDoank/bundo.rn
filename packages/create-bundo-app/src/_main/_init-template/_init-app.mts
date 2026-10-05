import * as node_fs from "node:fs"
import * as node_path from "node:path"

import BundoRnPackageJson from "../../../../bundo.rn/package.json" with { type: "json" }

import {
	GlobalVars,
} from "../_global-vars/index.mts"

export async function initApp() {

	const
		platform =
			GlobalVars.platform.get(),

		packageManager =
			GlobalVars.packageManager.get(),

		isMonorepoProject =
			packageManager == "bun" || packageManager == "pnpm",

		isMacos =
			platform.includes("macos"),

		isWindows =
			platform.includes("windows")

	if(isMacos) {
		await initFiles("macos", isMonorepoProject)
	} else if(isWindows) {
		await initFiles("windows", isMonorepoProject)
	} else {
		throw new Error(`Unexpected platform ${platform} to proceed.`)
	}

}

async function initFiles(
	platform: "macos" | "windows",
	isMonorepo?: boolean,
) {
	const
		templatesDir =
			GlobalVars.templatesDir.get(),

		appDir =
			isMonorepo
				? node_path.join(process.cwd(), "apps", `${platform}-app`)
				: process.cwd()

	node_fs.cpSync(
		node_path.join(templatesDir, "bundo-base"),
		appDir,
		{
			recursive: true,
			force: true,
		},
	)

	// $$metro.config.js
	// $$metro.monorepo.config.js
	{
		const
			metroConfigJsPath =
				node_path.join(appDir, "metro.config.js"),

			$$metroConfigJsPath =
				node_path.join(appDir, "$$metro.config.js"),

			$$metroMonorepoConfigJsPath =
				node_path.join(appDir, "$$metro.monorepo.config.js")

		if(isMonorepo) {
			node_fs.rmSync($$metroConfigJsPath)
			node_fs.renameSync(
				$$metroMonorepoConfigJsPath,
				metroConfigJsPath,
			)
		} else {
			node_fs.rmSync($$metroMonorepoConfigJsPath)
			node_fs.renameSync(
				$$metroConfigJsPath,
				metroConfigJsPath,
			)
		}
	}

	// $$tsconfig.json
	node_fs.renameSync(
		node_path.join(appDir, "$$tsconfig.json"),
		node_path.join(appDir, "tsconfig.json"),
	)

	// tsconfig.node.json
	// tsconfig.react-native.json
	{
		const
			tsconfigNodeJsonPath =
				node_path.join(appDir, "tsconfig.node.json"),

			tsconfigReactNativeJsonPath =
				node_path.join(appDir, "tsconfig.react-native.json")

		let
			tsconfigNodeJson =
				JSON.parse(
					node_fs.readFileSync(
						tsconfigNodeJsonPath,
						"utf8",
					),
				) as typeof import("../../../templates/bundo-base/tsconfig.node.json"),

			tsconfigReactNativeJson =
				JSON.parse(
					node_fs.readFileSync(
						tsconfigReactNativeJsonPath,
						"utf8",
					),
				) as typeof import("../../../templates/bundo-base/tsconfig.react-native.json")

		if(isMonorepo) {
			tsconfigNodeJson.extends =
				tsconfigNodeJson.extends.replace("$$", "../../")

			tsconfigReactNativeJson.extends =
				tsconfigReactNativeJson.extends.replace("$$", "../../")
		} else {
			// copy the tsconfig.base.json from the templates/bundo-monorepo-project.
			// borrow tsconfig.base.node.json & tsconfig.base.react-native.json from monorepo template
			// apply the configuration to the tsconfig.node.json & tsconfig.react-native.json

			node_fs.cpSync(
				node_path.join(templatesDir, "bundo-monorepo-project", "tsconfig.base.json"),
				node_path.join(appDir, "tsconfig.base.json"),
				{
					force: true,
				},
			)

			const
				tsconfigBaseNodeJson =
					JSON.parse(
						node_fs.readFileSync(
							node_path.join(templatesDir, "bundo-monorepo-project", "tsconfig.base.node.json"),
							"utf8",
						),
					) as typeof import("../../../templates/bundo-monorepo-project/tsconfig.base.node.json"),

				tsconfigBaseReactNativeJson =
					JSON.parse(
						node_fs.readFileSync(
							node_path.join(templatesDir, "bundo-monorepo-project", "tsconfig.base.react-native.json"),
							"utf8",
						),
					) as typeof import("../../../templates/bundo-monorepo-project/tsconfig.base.react-native.json")

			tsconfigNodeJson =
				{
					...tsconfigBaseNodeJson,
					compilerOptions: {
						composite: true, // reapply the composite option
						...tsconfigBaseNodeJson.compilerOptions,
					},
					include: tsconfigNodeJson.include,
				}

			tsconfigReactNativeJson =
				{
					...tsconfigBaseReactNativeJson,
					compilerOptions: {
						composite: true, // reapply the composite option
						...tsconfigBaseReactNativeJson.compilerOptions,
					},
					include: tsconfigReactNativeJson.include,
				}
		}

		node_fs.writeFileSync(
			tsconfigNodeJsonPath,
			JSON.stringify(tsconfigNodeJson, null, 2),
			"utf8",
		)

		node_fs.writeFileSync(
			tsconfigReactNativeJsonPath,
			JSON.stringify(tsconfigReactNativeJson, null, 2),
			"utf8",
		)
	}

	// $$.gitignore
	node_fs.renameSync(
		node_path.join(appDir, "$$.gitignore"),
		node_path.join(appDir, ".gitignore"),
	)

	node_fs.cpSync(
		// create-bundo-app/templates/bundo-base-(macos|windows)
		node_path.join(templatesDir, `bundo-base-${platform}`),
		appDir,
		{
			recursive: true,
			force: true,
		},
	)

	// package.json
	{
		const
			packageJsonTemplatePath =
				node_path.join(templatesDir, `bundo-base-${platform}`, "package.json"),

			packageJsonPath =
				node_path.join(appDir, "package.json"),

			packageJson =
				JSON.parse(
					node_fs.readFileSync(
						packageJsonTemplatePath,
						"utf8",
					),
				) as typeof import("../../../templates/bundo-base-macos/package.json"),

			packageJsonMonorepoTemplatePath =
				node_path.join(templatesDir, "bundo-monorepo-project", "package.json"),

			packageJsonMonorepoTemplate =
				JSON.parse(
					node_fs.readFileSync(
						packageJsonMonorepoTemplatePath,
						"utf8",
					),
				) as typeof import("../../../templates/bundo-monorepo-project/package.json"),

			resolvedDependencies =
				await resolveDependenciesVersion({
					dependencies: packageJson.dependencies,
					isMonorepo: !!isMonorepo,
					packageJsonMonorepoTemplate,
				}),

			dependencies: Record<string, string> =
				isMonorepo
					? {
						"app-ui": "workspace:*",
						...resolvedDependencies,
					}
					: resolvedDependencies,

			devDependencies: Record<string, string> =
				await resolveDependenciesVersion({
					dependencies: packageJson.devDependencies,
					isMonorepo: !!isMonorepo,
					packageJsonMonorepoTemplate,
				})

		packageJson.dependencies = dependencies as typeof packageJson.dependencies
		packageJson.devDependencies = devDependencies as typeof packageJson.devDependencies

		node_fs.writeFileSync(
			packageJsonPath,
			JSON.stringify(packageJson, null, 2),
			"utf8",
		)
	}

	// src/$$App.tsx
	// src/$$App-monorepo.tsx
	{
		const
			appTsxPath =
				node_path.join(appDir, "src", "App.tsx"),

			$$appTsxPath =
				node_path.join(appDir, "src", "$$App.tsx"),

			$$appMonorepoTsxPath =
				node_path.join(appDir, "src", "$$App-monorepo.tsx")

		if(isMonorepo) {
			node_fs.rmSync($$appTsxPath)
			node_fs.renameSync(
				$$appMonorepoTsxPath,
				appTsxPath,
			)
		} else {
			node_fs.rmSync($$appMonorepoTsxPath)
			node_fs.renameSync(
				$$appTsxPath,
				appTsxPath,
			)
		}
	}
}

async function resolveDependenciesVersion(
	data: {
		dependencies: Record<string, string>,
		isMonorepo: boolean,
		packageJsonMonorepoTemplate: typeof import("../../../templates/bundo-monorepo-project/package.json"),
	},
): Promise<Record<string, string>> {
	const dependencies: Record<string, string> = {}

	for(const [dependency, version] of Object.entries(data.dependencies)) {
		if(dependency == "bundo.rn") {
			if(data.isMonorepo) {
				dependencies["bundo.rn"] = "catalog:"
			} else {
				const bundoRnVersion = await fetch(
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

				dependencies["bundo.rn"] = bundoRnVersion
			}
		} else {
			if(
				!data.isMonorepo &&
				version == "catalog:"
			) {
				// resolve the actual dependency versioning from the catalog package.json

				const catalogVersion = (data.packageJsonMonorepoTemplate.workspaces.catalog as Record<string, string>)[dependency]

				if(catalogVersion) {
					dependencies[dependency] = catalogVersion
				}
			} else {
				dependencies[dependency] = version
			}
		}
	}

	return dependencies
}
