import type {
	Plugin,
} from "bundo.rn/appgen"

import {
	findLastLineOf,
} from "./_find-last-line-of.mts"

import type {
	Parameter,
} from "./_parameter.ts"

export default function(ctx: Plugin.Context<Parameter>) {
	if(ctx.parameter?.hideTitleBar) {

		const appDelegateLines = ctx.macos.files.Project["AppDelegate.swift"].split(/\n/)

		// Add modifier chain `.windowStyle(.hiddenToolbar)`
		// to the `Window`
		let
			existingModifierChainLine =
				-1,

			windowBlockStartLine =
				-1

		{
			let ln = -1
			for(const line of appDelegateLines) {
				ln++
				if(/\s\s\s\sWindow\(.*\{/.test(line)) {
					windowBlockStartLine = ln
					break
				}
			}
		}
		{
			let ln = -1
			for(const line of appDelegateLines) {
				ln++
				if(ln < windowBlockStartLine) {
					continue
				}
				if(/\s\s\s\s\.windowStyle\(.hiddenTitleBar\)/.test(line)) {
					existingModifierChainLine = ln
					break
				}
			}
		}

		if(windowBlockStartLine == -1) {
			throw new Error("Unexpected template files. Cannot find \"Window(...)\" line in AppDelegate.swift.")
		}

		// find the until the end curly bracket found
		const windowBlockEndLine = findLastLineOf(
			/\s\s\s\s\}/,
			appDelegateLines,
			windowBlockStartLine,
		)

		// find the first curly end bracket with four spaces.
		// We guess that /\s\s\s\s\}/ is the end bracket of Window
		// If user somehow add/remove the space
		for(let ln = windowBlockStartLine; ln < appDelegateLines.length; ln++) {
			//
		}

		if(windowBlockEndLine == -1) {
			throw new Error("Unexpected template files. Cannot find the end \"}\" of \"Window\" line in AppDelegate.swift.")
		}

		// no existing modifier chain found
		if(existingModifierChainLine == -1) {
			// After the end curly bracket found,
			// find until we found the end of method chain
			// Otherwise, the curly bracket is the end line.
			const modifierEndLine = findLastLineOf(
				/(\s+\..*\()/,
				appDelegateLines,
				windowBlockEndLine,
			)

			appDelegateLines.splice(
				modifierEndLine > -1
					? modifierEndLine + 1
					: windowBlockEndLine + 1,
				0,
				// six spaces
				"      .windowStyle(.hiddenTitleBar)",
			)
		}

		{
			// Add modifier chain `.ignoresSafeArea()` to the ReactNativeView

			let reactNativeViewStartLine = -1
			{
				let ln = -1
				for(const line of appDelegateLines) {
					ln++
					if(ln <= windowBlockStartLine) {
						continue
					}
					if(/\s+ReactNativeView\(.*/.test(line)) {
						reactNativeViewStartLine = ln
						break
					}
				}
			}

			if(reactNativeViewStartLine == -1) {
				throw new Error("Unexpected template files. Cannot find \"ReactNativeView(...)\" line in AppDelegate.swift.")
			}

			// find until we found the end of method chain
			// Otherwise, reactNativeEndLine = reactNativeStartLine
			// reactNativeEndLine will be -1 if the `.ignoresSafeArea()` chain found
			let reactNativeViewEndLine = reactNativeViewStartLine

			for(let ln = reactNativeViewStartLine; ln < windowBlockEndLine; ln++) {
				const line = appDelegateLines[ln]

				if(!line) {
					continue
				}

				if(ln == reactNativeViewStartLine && line.includes(".ignoresSafeArea()")) {
					// if the same line of `ReactNativeView()` contains modifier chain and the .ignoresSafeArea() found
					// set the `reactNativeEndLine` to -1 to skip adding the modifier
					// and break this loop
					reactNativeViewEndLine = -1
					break
				}

				if(/(\s+\..*\()/.test(line)) {
					// if the modifier `.ignoresSafeArea()` found
					// set the `reactNativeEndLine` to -1 to skip adding the modifier
					// and break this loop
					if(line.includes(".ignoresSafeArea()")) {
						reactNativeViewEndLine = -1
						break
					} else {
						reactNativeViewEndLine = ln
					}
				}
			}

			if(reactNativeViewEndLine > -1) {
				appDelegateLines.splice(
					reactNativeViewEndLine + 1,
					0,
					// eight spaces
					"        .ignoresSafeArea()",
				)
			}
		}

		ctx.macos.files.Project["AppDelegate.swift"] =
			appDelegateLines.join("\n")

	}
}
