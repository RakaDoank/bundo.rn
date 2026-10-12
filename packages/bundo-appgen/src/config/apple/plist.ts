import type {
	PlistValue,
} from "./plist-value"

export interface Plist extends Record<string, PlistValue> {
}
