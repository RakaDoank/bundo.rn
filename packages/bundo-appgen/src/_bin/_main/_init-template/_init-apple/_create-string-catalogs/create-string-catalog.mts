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
		platform: "macos",
	},
) {

	const
		config =
			GlobalVars.appConfig.get(),

		targetProjectDir =
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
				: null,

		stringCatalogsTrackerFilePath =
			ConfigHelpers.CachePaths.stringCatalogsTrackerFile()

	let catalogsTracker: CatalogsTrackerSchema = {
		catalogs: undefined,
	}

	if(!catalogs?.length) {
		if(node_fs.existsSync(stringCatalogsTrackerFilePath)) {
			node_fs.rmSync(stringCatalogsTrackerFilePath)
		}

		return
	}

	try {
		catalogsTracker =
			node_fs.existsSync(stringCatalogsTrackerFilePath)
				? JSON.parse(
					node_fs.readFileSync(stringCatalogsTrackerFilePath, "utf8"),
				) as CatalogsTrackerSchema
				: { catalogs: undefined } satisfies CatalogsTrackerSchema
	} catch {
		// do nothing
	}

	if(catalogsTracker.catalogs?.length) {
		catalogsTracker.catalogs.slice().forEach((existingCatalog, index) => {
			if(!stringCatalogs?.[existingCatalog]) {
				const existingPath = getCatalogFilePath({
					targetProjectDirectory: targetProjectDir,
					catalogName: existingCatalog,
				})
				if(node_fs.existsSync(existingPath)) {
					node_fs.rmSync(
						existingPath,
						{
							force: true,
						},
					)
				}

				catalogsTracker.catalogs?.splice(index, 1)
			}
		})
	}

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
			getCatalogFilePath({
				targetProjectDirectory: targetProjectDir,
				catalogName,
			}),
			JSON.stringify(
				json,
				null,
				2,
			),
			"utf8",
		)

		if(!catalogsTracker.catalogs?.length) {
			catalogsTracker.catalogs = []
		}

		if(catalogsTracker.catalogs.indexOf(catalogName) == -1) {
			catalogsTracker.catalogs.push(catalogName)
		}
	}

	node_fs.writeFileSync(
		stringCatalogsTrackerFilePath,
		JSON.stringify(catalogsTracker, null, 2),
		"utf8",
	)

}

interface CatalogsTrackerSchema {
	/**
	 * The catalog / file name
	 */
	catalogs: string[] | undefined,
}

function getCatalogFilePath(
	data: {
		targetProjectDirectory: string,
		catalogName: string,
	},
) {
	return node_path.join(
		data.targetProjectDirectory,
		`${data.catalogName}.xcstrings`,
	)
}
