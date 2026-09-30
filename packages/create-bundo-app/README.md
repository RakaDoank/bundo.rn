# create-bundo-app

Create a fresh bundo.rn app with `create-bundo-app` with a single command.

> :warning: react-native-windows is not available yet. We will support it later.

## Table of Contents

- [Requirements](#requirements)
- [Usage](#usage)
- [Running the App](#running-the-app)
- [Caveat](#caveat)
  - [Monorepo Style](#monorepo-style)
  - [TypeScript & ESLint](#typescript--eslint)

## Requirements

See [`bundo-appgen` Requirements](https://github.com/RakaDoank/bundo.rn/tree/main/packages/bundo-appgen/README.md).

## Usage

From your terminal, go to a directory or folder where all the necessary files will be created, and then simply run `create-bundo-app` command

Bun
```bash
bunx create-bundo-app
```

pnpm
```bash
pnpx create-bundo-app
```

npm
```bash
npx create-bundo-app
```

You will be asked for some options that required for the command logic to create project files.

## Running the App

> This section is assuming that you are using Bun

1. Install JavaScript dependencies
    ```bash
    bun install
    ```

2. Go to /apps/macos-app directory, and generate your native project with command
    ```bash
    bun run appgen
    ```

3. Then, you can run the Metro server
    ```bash
    bun run start
    ```

4. Finally, run your app with Xcode.

    You can also run your app with command

    ```bash
    bunx react-native run-macos --scheme HelloWorld
    ```

    The target name ("HelloWorld") is the .xcworkspace folder name without the .xcworkspace in the /macos directory.

## Caveat

### Monorepo Style

`create-bundo-app` will create a fresh new project in monorepo style if [Bun](https://github.com/oven-sh/bun) or [pnpm](https://github.com/pnpm/pnpm) has been selected for the package manager option. This is an intentional behaviour to manage both [`react-native-macos`](https://github.com/microsoft/react-native-macos) and [`react-native-windows`](https://github.com/microsoft/react-native-windows) host app, because the latest [`react-native-macos`](https://github.com/microsoft/react-native-macos) and [`react-native-windows`](https://github.com/microsoft/react-native-windows) do not depend on the same upstream version of `react-native`.

Your source code are still sharable for both app through `packages`. We have created a package named `app-ui` in your packages directory as an example, along with the Metro configuration to make it work.

**This style requires you to knowledge how to manage React Native tools work within monorepo**, e.g. using local packages that lives outside of the host app.

### TypeScript & ESLint

`create-bundo-app` will also create your project with TypeScript and ESLint compatible. This is purely optional, you can remove TypeScript and/or ESLint from your package.json. Although nowadays, it is recommended to write your modern app with TypeScript, and maintain your code quality with ESLint. `create-bundo-app` also provides a simple scripts property to your package.json for TypeScript and ESLint checking.

