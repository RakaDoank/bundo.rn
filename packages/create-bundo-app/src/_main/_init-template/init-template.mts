import {
	initApp,
} from "./_init-app.mts"
import {
	initMonorepo,
} from "./_init-monorepo.mts"

export async function initTemplate() {

	await initMonorepo()
	await initApp()

}
