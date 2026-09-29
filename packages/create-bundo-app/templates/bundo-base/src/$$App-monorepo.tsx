import {
  Screens,
} from "app-ui"

import {
  SafeAreaProvider,
} from "react-native-safe-area-context"

export function App() {

  return (
    <SafeAreaProvider>
      <Screens.NewApp/>
    </SafeAreaProvider>
  )

}
