const
	node_path =
		require("node:path")

module.exports = {
	source: node_path.join(__dirname, "src"),
	output: node_path.join(__dirname, "lib"),
	targets: [
		[
			"commonjs",
			{
				"esm": true,
			},
		],
		[
			"module",
			{
				"esm": true,
			},
		],
	],
}
