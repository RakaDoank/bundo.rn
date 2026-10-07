# bundo-appgen

Generate native app project for React Native app host easily with a single JavaScript configuration, and a CLI.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
  - [Configuration File](#configuration-file)
  - [Command Execution](#command-execution)
- [Background](#background)
  - [Sandboxed Plugin](#sandboxed-plugin)

## Requirements

- Node.js v22 or latest
- **macOS**
  - [XcodeGen](https://github.com/yonaskolb/xcodegen) latest version for macOS .xcodeproj generator. You can install XcodeGen with Homebrew
  - Ruby v3 or latest
  - [CocoaPods](https://cocoapods.org) dependency manager
- (Optional) [tsx](https://github.com/privatenumber/tsx) if you want to use TypeScript configuration for `bundo-appgen`

Technically, you can use [Bun](https://github.com/oven-sh/bun), but `bundo-appgen` is depending on [Node.js Permission Model](https://nodejs.org/api/permissions.html) for `bundo-appgen` plugins. We may support for [Bun](https://github.com/over-sh/bun) fully until the permission model is supported. See [Bun #6617 issue](https://github.com/oven-sh/bun/issues/6617). You can still use [Bun](https://github.com/oven-sh/bun) for local app development.

## Installation

Install `bundo-appgen` in your project

Bun
```
bun install bundo-appgen
```

pnpm
```
pnpm install bundo-appgen
```

npm
```
npm install bundo-appgen
```

Fortunately, you can install `bundo-appgen` in your existing [`react-native-macos`](https://github.com/microsoft/react-native-macos) app, because `bundo-appgen` is a single independent package.

## Usage

### Configuration File

Create `bundo.config.mjs` file that lives beside of your package.json project

```js
/**
 * @type {import("bundo-appgen").Config.Data}
 */
const config = {

  name: "Your App Name",

  macos: {
    bundleIdentifier: "com.yourcompany",
    buildVersion: "1",
    version: "1.0.0",
  },

}

export default config
```

#### TypeScript Configuration File

You can also use TypeScript config file, but you need [tsx](https://github.com/privatenumber/tsx) installed in your project as development dependency. Create `bundo.config.mts` or `bundo.config.ts` that lives beside of your package.json project

```ts
import {
  Config,
} from "bundo-appgen"

export default {

  name: "Your App Name",

  macos: {
    bundleIdentifier: "com.yourcompany",
    buildVersion: "1",
    version: "1.0.0",
  },

} satisfies Config.Data 
```

Explore other options in the [`Config.Data` type definitions](https://github.com/RakaDoank/bundo.rn/blob/main/packages/bundo-appgen/src/config/data.ts), such as changing app icon, app fonts, Info Plist, etc. We will provide a well documentation later regarding this. You can visit our [development playground](https://github.com/RakaDoank/bundo.rn/blob/main/playground) for your references.

### Command Execution

`bundo-appgen` provides a command line interface to generate native project directory as a React Native app host. If you have experience with [Expo Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation), this is really similar to the `expo prebuild` command.

> :warning: If you are using `bundo-appgen` in your existing [`react-native-macos`](https://github.com/microsoft/react-native-macos) app, backup your entire project first, and remove the "macos" folder.

Now, generate your native app project by running this command

with Bun
```bash
bunx bundo-appgen
```

with pnpm
```bash
pnpx bundo-appgen
```

with npm
```bash
npx bundo-appgen
```

This command is doing these execution steps in order

1. Retrieve and evaluate the configuration file
2. Copy the [native macos template from `bundo-appgen`](https://github.com/RakaDoank/bundo.rn/tree/main/packages/bundo-appgen/template/macos) to your project
3. Modifying some files to the native template files, such as project renaming
4. Run `bundo-appgen` plugin runner, and evaluating the result from plugins through IPC child process
5. Modify some template files, because a plugin may want to customize it
6. Execute `xcodegen` command to generate .xcodeproj directory

Now, you should see "macos" generated folder by the appgen command.

Run `bunx bundo-appgen --help` for more informations.

## Running the App

Register your React entry with `AppRegistry` in your `index.js` file with "**main**" name

```tsx
import {
  AppRegistry,
} from "react-native"

import App from "./App"

AppRegistry.registerComponent("main", () => App)
```

Finally, you can run Metro server `bun run start`, and run the app via Xcode.

You can also run your app with command
```
bunx react-native run-macos --scheme HelloWorld
```

The target name ("HelloWorld") is the .xcworkspace folder name without the .xcworkspace in the /macos directory.

---

## Background

We want to wrap a native project as a React Native app host easily without hurting so much times by touching the native code or native platform tooling e.g. changing app icon, app metadata, touching native C++, Swift & Objective-C code for upgrading React Native, etc.

This package is heavily inspired by the [Expo Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation). Expo does a heavy lifting, and can make developers focus more on providing and delivering the actual product.

`bundo-appgen` also wants to get the same experience like Expo, but the main differentiation from Expo is **keeping each platform configurations separated**, instead of merging the configuration data in a single object configuration. We choose to do this way because it is too difficult to support other platforms such as macOS, and other platforms in a single object. What we mean a single object is `bundo-appgen` provides a configuration for macOS and Windows not within the same kind of data or field, instead `bundo-appgen` provides platform configurations individually. This is much easier for prototyping the native app project because each platform have some unique configurations that other platforms don't have, and we can follow each platform requirements much easier.

For an example, you can see a configuration file example below

```ts
import {
  Config,
} from "bundo-appgen"

export default {
  
  // the `name` is shared, but overwriting through
  // the platform configuration is still possible,
  // e.g. CFBundleDisplayName in macOS Info.plist
  name: "Hello World App",

  macos: {

    appicon: "MyAppIcon",

    assetCatalog: {
      appiconset: [
        Config.Apple.createOSXappiconset({
          name: "MyAppIcon",
          images: {
            "1024x1024": "./path/to/your-image-1024.png",
            "512x512": "./path/to/your-image-512.png",
            "256x256": "./path/to/your-image-256.png",
            "128x128": "./path/to/your-image-128.png",
            "64x64": "./path/to/your-image-64.png",
            "32x32": "./path/to/your-image-32.png",
            "16x16": "./path/to/your-image-16.png",
          },
        }),
      ],
    },

    resources: [
      "./node_modules/ui-module/assets/fonts",
    ],
    infoPlist: {
      ATSApplicationFontsPath: "fonts/",
      NSMicrophoneUsageDescription: "We need to access your microphone, no questions!",
    },

    locales: ["en", "de"]

    stringCatalogs: {
      InfoPlist: {
        NSMicrophoneUsageDescription: {
          en: "We need to access your microphone, no questions!",
          de: "Wir mussen auf ihr Mikrofon zugreiefen, ohne Wenn und Aber!"
        },
      },
    }

  },

  windows: {
    // later
  },

  android: {
    // later
  },

  plugins: [],

} satisfies Config.Data
```

`bundo-appgen` is currently supporting macOS. Right after we are sure that our appgen (App Generator) for macOS is fully-ready-stabily, `bundo-appgen` will try to support the Windows platform, because it is really our primary main focus initially.

For Android and iOS, it is better to use [Expo](https://github.com/expo/expo) right now. It provides variety of first party packages in its ecosystem.

### Sandboxed Plugin

Not to mention, `bundo-appgen` is also sandboxing the plugin invocation. We do not allow a plugin to perform an unrestricted action such as File System, Networking, Child Process, and other actions in Node.js. See [Node.js Permission Model](https://nodejs.org/api/permissions.html).

We only allow plugins to run their main function in restricted permission. Currently, we only allow this listed permission for plugin
- **File System** - **Read only** access to these directories and/or files
  - &lt;project&gt;/macos/HelloWorld/AppDelegate.swift
  - &lt;project&gt;/macos/Podfile
  - node_modules directory lookup relatively from your project and global modules
  - Their own plugin directory

A plugin can still modify the templated files, such as `AppDelegate.swift` file for the macOS, but a plugin will only be allowed to modify in a manner way through a raw JavaScript string that `bundo-appgen` gives to their main function, instead of using file system to write. For your references, you can see our [`bundo-window` plugin main function](https://github.com/RakaDoank/bundo.rn/blob/main/packages/bundo-window/_plugin/bundo.plugin.mts) to modify the `AppDelegate.swift` to make the macOS app has no title bar.

We create a module that what we called "plugin runner". From the `bundo-appgen` command, it will spawn another Node.js child process with restricted permission to run the plugin runner. The plugin runner will invoke all the plugins main function provided with a JavaScript object (context) argument given. When all the plugin invocation have finished, we send the result to the main process through **Inter Process Communication**, and then, the main process will be responsible to do the actual writing to the template files.

We choose this model because we choose the Zero Trust approach. We do not want a plugin performs a malicious action in your machine with reading and writing to any directories (file system), networking, and spawning a child process.
