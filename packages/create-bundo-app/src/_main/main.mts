import * as node_fs from "node:fs"
import * as node_path from "node:path"

import * as Prompts from "@inquirer/prompts"

import {
	GlobalVars,
} from "./_global-vars/index.mts"

import {
	initTemplate,
} from "./_init-template/index.mts"

export async function main(
	createBundoAppRoot: string,
) {

	if(
		node_fs.existsSync(
			node_path.join(
				process.cwd(),
				"package.json",
			),
		)
	) {
		console.log("Create Bundo App has been canceled.")
		console.log("\x1b[31mCurrent working directory is not empty.\x1b[0m")
		return
	}

	const
		// We don't know we can support the Windows yet.
		// I am still on research to support the Windows platform as good as the macOS's App Generator.
		// At this moment, just use "macos". Users don't need to select a platform.

		// platform =
		// 	await Prompts.select({
		// 		message: "Choose Platform",
		// 		choices: [{
		// 			value: "macos+windows",
		// 			name: "macOS + Windows",
		// 			disabled: "Windows is not ready yet",
		// 		}, {
		// 			value: "macos",
		// 			name: "macOS",
		// 		}, {
		// 			value: "windows",
		// 			name: "Windows",
		// 			disabled: "Windows is not ready yet",
		// 		}],
		// 		default: "macos",
		// 	}),
		platform =
			"macos",

		packageManager =
			await Prompts.select({
				message: "Package Manager",
				choices: [{
					value: "bun",
					name: "Bun",
					description: "A superfast npm-compatible package manager",
				}, {
					value: "pnpm",
					name: "pnpm",
					description: "Fast, disk space efficient package manager",
				}, {
					name: "npm",
					value: "npm",
					description: "Use traditional npm in Node.js",
					// disabled: platform == "macos+windows"
					// 	? "We have to create separate app. \"react-native-macos\" and \"react-native-windows\" don't support the same upstream version of React Native."
					// 	: false,
				}],
			})

	const
		confirmDirectory =
			await Prompts.confirm({
				message: `Are you sure you want to create the project in this directory? \`package.json\` and other files will be created in ${process.cwd()}`,
				default: true,
			})

	if(!confirmDirectory) {
		console.log("Create Bundo App has been canceled.")
		return
	}

	GlobalVars.root.set(createBundoAppRoot)
	GlobalVars.templatesDir.set(node_path.join(createBundoAppRoot, "templates"))
	GlobalVars.platform.set(platform)
	GlobalVars.packageManager.set(packageManager)

	console.log("Creating project…")
	initTemplate()

	console.log("\x1b[32mProject has been created successfully.\x1b[0m")

	if(packageManager == "bun" || packageManager == "pnpm") {

		console.log(`
Getting Started:

1. (Optional) Rename the "macos-app" and the "windows-app" folder in the /apps with your desired name

2. Provide your app name in the /apps/*/bundo.config.mjs

3. Run \`${packageManager} install\` to install all the JavaScript dependencies

4. Go to /apps/*/ directory

5. Run \`${packageManager} run appgen\` to generate native project

6. Run the Metro server \`${packageManager} run start\`

7. Voila! Run your app with Xcode

   or you can run it with
   \`${packageManager} run macos -- --scheme HelloWorld\` command.
   (The target name is the .xcworkspace folder name without the .xcworkspace in the /macos directory)
`)

	} else {

		console.log(`
Getting Started:

1. Run \`${packageManager} install${packageManager == "npm" ? " --force" : ""}\` to install all the JavaScript dependencies

2. Provide your app name in the bundo.config.mjs

3. Run \`${packageManager} run appgen\` to generate native project

4. Run the Metro server \`${packageManager} run start\`

5. Voila! Run your app with Xcode

   or you can run it with
   \`${packageManager} run macos -- --scheme HelloWorld\`.
   (The target name is the .xcworkspace folder name without the .xcworkspace in the /macos directory)
`)

	}

}
