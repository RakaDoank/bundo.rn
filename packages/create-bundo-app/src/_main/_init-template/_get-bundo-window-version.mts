import BundoWindowPackageJson from "../../../../bundo-window/package.json" with { type: "json" }

let cacheBundoWindowVersion = ""

export async function getBundoWindowVersion(): Promise<string> {
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
