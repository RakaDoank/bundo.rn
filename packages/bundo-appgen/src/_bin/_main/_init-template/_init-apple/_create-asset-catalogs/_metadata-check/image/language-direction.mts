import type * as Config from "../../../../../../../config/index.mts"

export function languageDirection(value: string): boolean {
	return !!value && !!__languageDirection[value as never]
}

const
	__languageDirection: Record<Config.Apple.AssetCatalogFormat.Image.LanguageDirection, 1> =
		{
			"left-to-right": 1,
			"right-to-left": 1,
		}
