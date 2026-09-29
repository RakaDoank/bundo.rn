import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native"

import * as BundoWindow from "bundo-window"

import {
  NewAppScreen,
} from "@react-native/new-app-screen"

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context"

import type {
  NewAppProps,
} from "./new-app-props"

export function NewApp({
  style,
  ...props
}: NewAppProps) {

  const
    safeAreaInsets =
      useSafeAreaInsets(),

    colorScheme =
      useColorScheme()
  
  return (
    <View
      { ...props }
      style={ [
        styleSheet.newAppScreen,
        style,
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
