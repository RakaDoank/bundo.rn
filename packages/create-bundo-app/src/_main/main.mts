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
		console.log("Create Bundo App has been cancelled.")
		console.log("\x1b[31mCurrent working directory is not empty.\x1b[0m")
		return
	}

	const
		confirmDirectory =
			await Prompts.select({
				message: "Are you sure you want to create a project in this directory?",
				choices: [{
					value: 0,
					name: "No",
				}, {
					value: 1,
					name: `Yes — package.json and other files will be created in ${process.cwd()}`,
					short: "Yes",
				}],
			})

	if(!confirmDirectory) {
		console.log("Create Bundo App has been cancelled.")
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
					name: "Bun — A superfast npm-compatible package manager",
					short: "Bun",
				}, {
					value: "pnpm",
					name: "pnpm — Fast, disk space efficient package manager",
					short: "pnpm",
				}, {
					value: "npm",
					name: "npm — Use traditional npm in Node.js",
					short: "npm",
				}],
			})

	GlobalVars.root.set(createBundoAppRoot)
	GlobalVars.templatesDir.set(node_path.join(createBundoAppRoot, "templates"))
	GlobalVars.platform.set(platform)
	GlobalVars.packageManager.set(packageManager)

	initTemplate()

	console.log("\x1b[1;32m✔ Project has been created successfully.\x1b[0m")

	if(packageManager == "bun" || packageManager == "pnpm") {

		console.log(`
Getting Started:

1. (Optional) Rename the "macos-app" folder in the /apps with your desired name

2. Run \`\x1b[1;36m${packageManager} install\x1b[0m\` to install all the JavaScript dependencies

3. Go to /apps/*/ folder

4. Provide your app name in the bundo.config.mjs file

5. Run \`\x1b[1;36m${packageManager} run appgen\x1b[0m\` to generate native project

6. Run the Metro server \`\x1b[1;36m${packageManager} run start\x1b[0m\`

7. Voila! Run your app with Xcode

   or you can run it with
   \`\x1b[1;36m${packageManager} run macos -- --scheme HelloWorld\x1b[0m\` command.
   (The target name is the .xcworkspace folder name without the .xcworkspace in the /macos directory)
`)

	} else {

		console.log(`
Getting Started:

1. Run \`\x1b[1;36m${packageManager} install${packageManager == "npm" ? " --force" : ""}\x1b[0m\` to install all the JavaScript dependencies

2. Provide your app name in the bundo.config.mjs file

3. Run \`\x1b[1;36m${packageManager} run appgen\x1b[0m\` to generate native project

4. Run the Metro server \`\x1b[1;36m${packageManager} run start\x1b[0m\`

5. Voila! Run your app with Xcode

   or you can run it with
   \`\x1b[1;36m${packageManager} run macos -- --scheme HelloWorld\x1b[0m\`.
   (The target name is the .xcworkspace folder name without the .xcworkspace in the /macos directory)
`)

	}

}
