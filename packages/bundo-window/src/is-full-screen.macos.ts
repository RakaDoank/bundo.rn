import NativeBundoWindow from "./_internal/native-modules/NativeBundoWindow"

export function isFullScreen() {
	return NativeBundoWindow.isFullScreen()
}
