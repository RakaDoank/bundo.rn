import type * as Config from "../../../../../../../config/index.mts"

export function compressionType(value: string): boolean {
	return !!value && !!__compressionType[value as never]
}

const
	__compressionType: Record<Config.Apple.AssetCatalogFormat.Image.CompressionType, 1> =
		{
			"gpu-optimized-best": 1,
			"gpu-optimized-smallest": 1,
			automatic: 1,
			lossless: 1,
			lossy: 1,
		}
