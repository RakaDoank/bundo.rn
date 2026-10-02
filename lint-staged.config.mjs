export default {
	/**
	 * @param {string[]} files
	 */
	"*.(ts|tsx|mts|js|mjs|cjs)": files => {
		// Filter the commited file that supposed to be ignored by ESLint

		// /packages/create-bundo-app/templates
		const match = files.filter(file => {
			return !file.includes("create-bundo-app/templates")
		})

		return `eslint --max-warnings=0 ${match.join(" ")}`
	},
}
