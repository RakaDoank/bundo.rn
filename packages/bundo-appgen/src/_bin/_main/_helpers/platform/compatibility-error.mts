export const CompatibilityError = new Error(`
Cannot run bundo.rn appgen CLI in non compatible platform or JavaScript development runtime.

bundo.rn CLIs are compatible for
Platforms: macOS, Windows, Linux
Development Runtime: Bun, Node.js
	`)
