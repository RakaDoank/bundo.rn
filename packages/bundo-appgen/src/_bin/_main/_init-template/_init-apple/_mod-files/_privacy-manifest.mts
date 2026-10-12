import * as node_fs from "node:fs"
import * as node_path from "node:path"

import type * as Config from "../../../../../config/index.mts"

import {
	GlobalVars,
} from "../../../../_global-vars/index.mts"

export function privacyManifest(
	platform: "macos",
) {

	const
		manifest =
			GlobalVars.appConfig.get()[platform as "macos"]?.privacyManifest

	if(!manifest) {
		return
	}

	const
		nativeProjectDir =
			node_path.join(
				node_path.dirname(GlobalVars.configFilePath.get()),
				platform,
			),

		privacyInfoFilePath =
			node_path.join(nativeProjectDir, "PrivacyInfo.xcprivacy")

	let privacyInfoFile = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>`

	for(const [key, plist] of Object.entries(manifest)) {
		privacyInfoFile += getDictionaryItem(key, plist)
	}

	privacyInfoFile += `
</dict>
</plist>`

	node_fs.writeFileSync(
		privacyInfoFilePath,
		privacyInfoFile,
		"utf8",
	)

}

/**
 * Info.plist and .entitlements file has done by the XcodeGen,
 * but if there are other plist-format files that we need to create than the PrivacyInfo.xcprivacy,
 * it is better to move out this function as a reusable helper for
 * writing a plist XML file.
 */
function getDictionaryItem(
	key: string,
	plist: Config.Apple.PlistValue,
	startIndentAmount: number = 1,
): string {

	const indent = Array(startIndentAmount).fill("\t").join("")

	let tx = `\n${indent}<key>${key}</key>`

	if(typeof plist == "boolean") {
		if(plist) {
			tx += `\n${indent}<true/>`
		} else {
			tx += `\n${indent}<false/>`
		}
	} else if(typeof plist == "string") {
		if(!plist) {
			throw new Error("A plist item is empty or not a valid string.")
		}

		tx += `\n${indent}<string>${plist}</string>`
	} else if(Array.isArray(plist)) {
		if(plist.length) {
			tx += `\n${indent}<array>`

			plist.forEach((value, index) => {
				if(typeof value == "string") {
					if(!value) {
						throw new Error(`${key}[${index}] is empty or not a valid string.`)
					}
					tx += `\n${indent}\t<string>${value}</string>`
				} else if(typeof value == "object" && value) {
					tx += `\n${indent}<dict>`

					for(const [key2, plist2] of Object.entries(value)) {
						tx += getDictionaryItem(key2, plist2, startIndentAmount + 1)
					}

					tx += `\n${indent}</dict>`
				}
			})

			tx += `\n${indent}</array>`
		} else {
			// allow empty array in the plist
			tx += `\n<array/>`
		}
	} else if(typeof plist == "object" && plist) {
		tx += `\n${indent}<dict>`

		for(const [key2, plist2] of Object.entries(plist)) {
			tx += getDictionaryItem(key2, plist2, startIndentAmount + 1)
		}

		tx += `\n${indent}</dict>`
	}

	return tx

}
