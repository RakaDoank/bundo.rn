import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native"

import * as BundoWindow from "bundo-window"

import {
  NewAppScreen,
} from "@react-native/new-app-screen"

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context"

export function App() {

  return (
    <SafeAreaProvider>
      <Screen/>
    </SafeAreaProvider>
  )

}

function Screen() {

  const
    safeAreaInsets =
      useSafeAreaInsets(),

    colorScheme =
      useColorScheme()

  return (
    <View
      style={ [
        styleSheet.newAppScreen,
      ] }
    >
      <View
        style={ [
          styleSheet.thankYouContainer,
          colorScheme == "dark"
            ? styleSheet.thankYouContainerBgDark
            : styleSheet.thankYouContainerBgLight,
          {
            height: safeAreaInsets.top, // traffic light height
            paddingLeft: BundoWindow.getTrafficLightStartInset(),
          },
        ] }
      >
        <Text
          style={ [
            styleSheet.thankYouText,
          ] }
        >
          Thank you for using bundo.rn
        </Text>
      </View>

      <NewAppScreen/>
    </View>
  )

}

const
  styleSheet =
    StyleSheet.create({
      newAppScreen: {
        flex: 1,
      },
      thankYouContainer: {
        justifyContent: "center",
      },
      thankYouContainerBgDark: {
        backgroundColor: "#000000",
      },
      thankYouContainerBgLight: {
        backgroundColor: "#f3f3f3",
      },
      thankYouText: {
        fontWeight: 600,
        paddingHorizontal: 16,
      },
    })
