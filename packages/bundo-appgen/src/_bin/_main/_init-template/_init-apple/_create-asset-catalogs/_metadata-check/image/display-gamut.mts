import type * as Config from "../../../../../../../config/index.mts"

export function displayGamut(value: string): boolean {
	return !!value && !!displayGamuts[value as never]
}

const
	displayGamuts: Record<Config.Apple.AssetCatalogFormat.Image.DisplayGamut, 1> =
		{
			"display-P3": 1,
			sRGB: 1,
		}
