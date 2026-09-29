import {
	NewAppScreen,
} from "@react-native/new-app-screen"

import {
	SafeAreaProvider,
} from "react-native-safe-area-context"

export function App() {

	return (
		<SafeAreaProvider>
			<NewAppScreen/>
		</SafeAreaProvider>
	)

}
