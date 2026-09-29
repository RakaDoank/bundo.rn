import type * as Config from "../../../../../../config/index.mts"

export function appearances(value: Array<unknown>): boolean {
	if(!Array.isArray(value) || value.length != 1 || !value[0] || typeof value[0] != "object") {
		return false
	}

	const it = value[0] as Record<string, string>

	return !!__appearance[it.appearance as never] && !!__value[it.value as never]
}

const
	__appearance: Record<Config.Apple.AssetCatalogFormat.Appearances[0]["appearance"], 1> =
		{
			contrast: 1,
			luminosity: 1,
		},

	__value: Record<Config.Apple.AssetCatalogFormat.Appearances[0]["value"], 1> =
		{
			dark: 1,
			light: 1,
		}
