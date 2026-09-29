import type * as Config from "../../../../../../config/index.mts"

export function idiom(value: string): boolean {
	return !!value && !!__idiom[value as never]
}

const
	__idiom: Record<Config.Apple.AssetCatalogFormat.Idiom, 1> =
		{
			"ios-marketing": 1,
			"watch-marketing": 1,
			appLauncher: 1,
			companionSettings: 1,
			ipad: 1,
			iphone: 1,
			mac: 1,
			notificationCenter: 1,
			quickLook: 1,
			tv: 1,
			universal: 1,
			watch: 1,
		}
