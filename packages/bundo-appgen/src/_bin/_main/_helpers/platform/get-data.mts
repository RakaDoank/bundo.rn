import {
	CompatibilityError,
} from "./compatibility-error.mts"

import type {
	Data,
} from "./data.ts"

import {
	isCompatible,
} from "./is-compatible.mts"

let cache: Data

/**
 * Throw error if this run in non compatible platform or non JavaScript development runtime.
 */
export function getData(): Data {
	if(cache) {
		return cache
	}

	if(!isCompatible()) {
		throw CompatibilityError
	}

	const isBun = typeof Bun !== "undefined" || !!process.versions.bun

	let developmentRuntime: Data["developmentRuntime"]

	if(isBun) {
		developmentRuntime = {
			type: "bun",
			version: process.versions.bun,
		}
	} else {
		developmentRuntime = {
			type: "node",
			version: process.versions.node,
		}
	}

	cache = {
		developmentRuntime,
	}

	return cache
}
