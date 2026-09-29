const
	prefixName =
		`__bundo_appgen_${Math.random()}_` as const,

	postfixSetCount =
		"_setcount" as const,

	postfixSetCountMax =
		"_setcountmax" as const

export function globalVars<TypeData = symbol>(
	name: string,
	initialValue: TypeData,
	/**
	 * @default 1
	 */
	maxSetCount?: number,
) {
	// @ts-expect-error custom var
	globalThis[prefixName + name] = initialValue

	// @ts-expect-error custom var
	globalThis[prefixName + name + postfixSetCount] = 0
	// @ts-expect-error custom var
	globalThis[prefixName + name + postfixSetCountMax] = maxSetCount ?? 1

	return {
		get(): TypeData {
			// @ts-expect-error custom var
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return globalThis[prefixName + name]
		},
		set(value: TypeData) {
			// @ts-expect-error custom var
			globalThis[prefixName + name + postfixSetCount] += 1

			if(
				// @ts-expect-error custom var
				globalThis[prefixName + name + postfixSetCount] > globalThis[prefixName + name + postfixSetCountMax]
			) {
				throw new Error("Exceeded amount of modifying.")
			}
			// @ts-expect-error custom var
			globalThis[prefixName + name] = value
		},
	}
}
