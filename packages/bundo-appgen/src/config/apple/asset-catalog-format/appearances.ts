/**
 * We mock this value from Xcode.
 * Xcode generates "appearances" with array value, even the image is only one appearance variant per image.
 * 
 * Probably, they have plan for the appearances in the future.
 */
export type Appearances = [{
	appearance: "luminosity" | "contrast",
	value: "light" | "dark",
}]
