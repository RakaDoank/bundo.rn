import {
	initApp,
} from "./_init-app.mts"
import {
	initMonorepo,
} from "./_init-monorepo.mts"

export function initTemplate() {

	initMonorepo()
	initApp()

}
