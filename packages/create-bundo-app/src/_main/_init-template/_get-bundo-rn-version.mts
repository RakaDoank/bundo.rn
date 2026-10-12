import BundoRnPackageJson from "../../../../bundo.rn/package.json" with { type: "json" }

let cacheBundoRnVersion = ""

export async function getBundoRnVersion(): Promise<string> {
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
