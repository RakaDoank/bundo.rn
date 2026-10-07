import * as node_fs from "node:fs"
import * as node_path from "node:path"

import BundoWindowPackageJson from "../../../../bundo-window/package.json" with { type: "json" }
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

	if(!isMacos && !isWindows) {
		throw new Error(`Unexpected platform "${platform}" to proceed.`)
	}

	if(isMacos) {
		await initFiles("macos", isMonorepoProject)
	}

	if(isWindows) {
		await initFiles("windows", isMonorepoProject)
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

	// eslint.config.mjs
	{
		// Borrow the eslint file from our template monorepo file

		const
			eslintConfigTemplatePath =
				node_path.join(templatesDir, "bundo-monorepo-project", "$$eslint.config.mjs"),

			eslintConfigPath =
				node_path.join(process.cwd(), "eslint.config.mjs")

		let
			eslintConfigFile =
				node_fs.readFileSync(eslintConfigTemplatePath, "utf8"),

			reactAndReactNativeLintFiles: string,

			nodeLintFiles: string

		if(isMonorepo) {
			reactAndReactNativeLintFiles =
				"$1\"./apps/*/src/**/*.{ts,tsx,js,jsx}\",\n"
				+ "$1\"./packages/*/src/**/*.{ts,tsx,js,jsx}\","

			nodeLintFiles =
				"$1\"./apps/*/*.config.{js,mjs,ts,mts}\",\n"
				+ "$1\"./scripts/**/*.{js,mjs,ts,mts}\","
		} else {
			reactAndReactNativeLintFiles =
				"$1\"./index.js\",\n"
				+ "$1\"./src/**/*.{ts,tsx,js,jsx}\","

			nodeLintFiles =
				"$1\"./*.config.{js,mjs,ts,mts}\",\n"
				+ "$1\"./scripts/**/*.{js,mjs,ts,mts}\","
		}

		eslintConfigFile = eslintConfigFile
			.replace(
				/^(\s+)\/\/\s\$\$react_and_react_native_files/m,
				reactAndReactNativeLintFiles,
			)
			.replace(
				/^(\s+)\/\/\s\$\$node_files/m,
				nodeLintFiles,
			)

		node_fs.writeFileSync(
			eslintConfigPath,
			eslintConfigFile,
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
				!isMonorepo
					? await resolveDependenciesSemverAsSinglePackage({
						dependencies: packageJson.dependencies,
						packageJsonMonorepoTemplate,
					})
					: packageJson.dependencies as Record<string, string>,

			dependencies: Record<string, string> =
				isMonorepo
					? {
						"app-ui": "workspace:*",
						...resolvedDependencies,
					}
					: resolvedDependencies

		packageJson.dependencies = dependencies as typeof packageJson.dependencies

		if(!isMonorepo) {
			packageJson.devDependencies =
				Object
					.entries({
						...(
							await resolveDependenciesSemverAsSinglePackage({
								dependencies: packageJson.devDependencies,
								packageJsonMonorepoTemplate,
							}) as typeof packageJson.devDependencies
						),

						// borrow some devDependencies from monorepo package.json
						// e.g. "eslint"
						...packageJsonMonorepoTemplate.devDependencies,
					})
					.sort()
					.reduce<Record<string, string>>((obj, [dependency, version]) => {
						obj[dependency] = version
						return obj
					}, {}) as typeof packageJson.devDependencies
		}

		node_fs.writeFileSync(
			node_path.join(appDir, "package.json"),
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

async function resolveDependenciesSemverAsSinglePackage(
	data: {
		dependencies: Record<string, string>,
		packageJsonMonorepoTemplate: typeof import("../../../templates/bundo-monorepo-project/package.json"),
	},
): Promise<Record<string, string>> {
	const dependencies: Record<string, string> = {}

	const [
		bundoWindowVersion,
		bundoRnVersion,
	] =
		await Promise.all([
			getBundoWindowVersion(),
			getBundoRnVersion(),
		])

	for(const [dependency, version] of Object.entries(data.dependencies)) {
		if(dependency == "bundo-window") {
			dependencies["bundo-window"] = `~${bundoWindowVersion}`
			continue
		}

		if(dependency == "bundo.rn") {
			dependencies["bundo.rn"] = `~${bundoRnVersion}`
			continue
		}

		if(version == "catalog:") {
			// resolve the actual dependency versioning from the catalog package.json

			const catalogVersion = (data.packageJsonMonorepoTemplate.workspaces.catalog as Record<string, string>)[dependency]

			if(catalogVersion) {
				dependencies[dependency] = catalogVersion
			}
		} else {
			dependencies[dependency] = version
		}
	}

	return dependencies
}

let cacheBundoWindowVersion = ""
async function getBundoWindowVersion(): Promise<string> {
	if(cacheBundoWindowVersion) {
		return cacheBundoWindowVersion
	}

	const ver = await fetch("https://registry.npmjs.org/bundo-window/latest")
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
			return BundoWindowPackageJson.version // fallback
		})

	cacheBundoWindowVersion = ver
	return ver
}

let cacheBundoRnVersion = ""
async function getBundoRnVersion(): Promise<string> {
	if(cacheBundoRnVersion) {
		return cacheBundoRnVersion
	}

	const ver = await fetch("https://registry.npmjs.org/bundo.rn/latest")
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
			return BundoRnPackageJson.version // fallback
		})

	cacheBundoRnVersion = ver
	return ver
}
