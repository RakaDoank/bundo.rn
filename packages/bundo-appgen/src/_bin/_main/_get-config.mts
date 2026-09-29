import * as node_module from "node:module"
import * as node_path from "node:path"

import type {
	Config,
} from "../../index.mts"

export async function getConfig(
	configFilePath: string,
): Promise<Config.Data> {
	const ext = node_path.extname(configFilePath)

	if(ext == ".ts" || ext == ".mts") {
		// Bun with the `--bun` flag
		if(typeof Bun !== "undefined" || process.versions.bun) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
			return import(configFilePath).then(c => c.default)
		}

		// Transpile and evaluate the TypeScript file
		// Possibly in Node.js with `tsx`

		// bundo-appgen library is intentionally putting the `tsx` as a optional dependency,
		// instead of peer or dev dependency
		// to respect users by warning them to install `tsx` manually

		// To be honest, I don't know much about TypeScript compiler API.
		// If someone in the future know much about TypeScript compiler API,
		// we don't need the `tsx` anymore.

		console.log("Resolving your TypeScript file config…")

		try {
			return import("tsx/cjs/api").then(async tsx => {
				const result = await tsx.require(configFilePath, __filename) as {
					default: Config.Data,
				}

				return result.default
			})
		} catch(err) {
			if(err instanceof Error && "code" in err && err.code === "ERR_MODULE_NOT_FOUND") {
				// eslint-disable-next-line preserve-caught-error
				throw new Error(`
For TypeScript config file, please install \`tsx\` as your dev dependency,
or you can use Bun, or just use the JavaScript config file.
`)
			}

			throw err
		}
	}

	// Pure JS

	if(ext == ".mjs") {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
		return import(configFilePath).then(c => c.default)
	}

	const requireModule = node_module.createRequire(configFilePath)
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return requireModule(configFilePath)
}
