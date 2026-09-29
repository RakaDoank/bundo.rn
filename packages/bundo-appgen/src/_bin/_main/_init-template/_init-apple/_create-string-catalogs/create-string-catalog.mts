import * as node_fs from "node:fs"
import * as node_path from "node:path"

import type * as Config from "../../../../../config/index.mts"

import {
	GlobalVars,
} from "../../../../_global-vars/index.mts"

import {
	ConfigHelpers,
} from "../../../_helpers/index.mts"

export function createStringCatalogs(
	stringCatalogs: Config.Apple.Data["stringCatalogs"],
	locales: string[] | undefined = ["en"],
	metadata: {
		platform: "macos" | "ios",
	},
) {

	const
		config =
			GlobalVars.appConfig.get(),

		nativeProjectDir =
			node_path.join(
				node_path.dirname(
					GlobalVars.configFilePath.get(),
				),
				metadata.platform,
				ConfigHelpers.getProjectName(config, metadata.platform)!,
			),

		catalogs =
			stringCatalogs
				? Object.entries(stringCatalogs)
				: null

	if(catalogs?.length) {
		for(const [catalogName, data] of catalogs) {
			const
				json: {
					sourceLanguage: string,
					strings: {
						[Key in string]: {
							extractionState: "manual",
							localizations: {
								[Locale in string]: {
									stringUnit: {
										state: "translated",
										value: string,
									}
								}
							}
						}
					},
					version: string,
				} =
					{
						sourceLanguage: locales[0]!,
						strings: {},
						version: "1.2",
					},
				/**
				 * The string key
				 */
				keys =
					Object.keys(data)

			for(const key of keys) {
				const localizedValue = data[key]

				if(!localizedValue) {
					throw new Error(`String catalog of ${catalogName} has invalid configuration.`)
				}

				const localesOfValue = Object.keys(localizedValue)

				{
					// check language from locale
					for(const localeOfValue of localesOfValue) {
						if(locales.indexOf(localeOfValue) == -1) {
							throw new Error(`"${localeOfValue}" was not found from your \`locales\` config. Add "${localeOfValue}" to the \`locales\` array.`)
						}
					}
				}

				localesOfValue.forEach(locale => {
					const value = localizedValue[locale]

					if(!value) {
						throw new Error(`\`stringCatalogs.${key}.${locale}\` is empty.`)
					}

					if(!json.strings[key]) {
						json.strings[key] = {
							extractionState: "manual",
							localizations: {
								[locale]: {
									stringUnit: {
										state: "translated",
										value,
									},
								},
							},
						}
					} else {
						json.strings[key].localizations[locale] = {
							stringUnit: {
								state: "translated",
								value,
							},
						}
					}
				})
			}

			node_fs.writeFileSync(
				node_path.join(
					nativeProjectDir,
					`${catalogName}.xcstrings`,
				),
				JSON.stringify(
					json,
					null,
					2,
				),
				"utf8",
			)
		}
	}

}
