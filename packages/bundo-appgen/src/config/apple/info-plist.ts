import type {
	InfoPlistValue,
} from "./info-plist-value"

export interface InfoPlist extends Record<string, InfoPlistValue> {
}
