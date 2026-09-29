import type * as Apple from "./apple/index.mts"

import type {
	PluginRegistry,
} from "./plugin-registry"

export interface Data {

	/**
	 * Please, only register a plugin in this field if you are really trust the plugin will not doing anything suspicious.
	 * 
	 * Plugin in this registry is **letting a plugin to run its function in less restrictive way**, and run after all the restrictive plugins has finished.
	 * 
	 * In this field, we let plugins run their functions in with these listed permissions
	 * 
	 * - File System : Read and/or write access to these directories:
	 * 	- _rw_ : &lt;project&gt;/macos
	 * 	- _rw_ : &lt;project&gt;/windows
	 * 	- _r_ : node_modules directory lookup relatively from your project and global modules
	 * 	- _r_ : Its own plugin directory
	 * - Networking : HTTP request such as `fetch`.
	 * 
	 * A plugin can modify some provided template files such as `AppDelegate.swift` without asking your permission.
	 * It is strongly recommended to check or audit your generated native project.
	 *  
	 * Read {@link https://nodejs.org/api/permissions.html|Node.js Permission Model} for more informations.
	 */
	lessRestrictivePlugins?: PluginRegistry,

	/**
	 * The name of your app as it appears on user screen as a standalone app. This value can be overriden in the platform specific config property if some cases the app name is different each platform.
	 * 
	 * This name will be used also for project name in Xcode and Visual Studio with removed spaces and special characters.
	 */
	name?: string,

	macos?: Apple.Data,

	/**
	 * Register a plugin for letting the plugin to customize your generated native project, such as adding assets, modifying native code, and other advanced configurations.
	 * 
	 * Plugins in this registry will only allow plugins to run their function in restrictive way. A plugin cannot perform a non restricted action such as File System, Networking, Child Process, and other actions in Node.js. See {@link https://nodejs.org/api/permissions.html|Node.js Permission Model}.
	 * 
	 * In this field, we let plugins run their functions in with these listed permissions
	 * 
	 * - File System - Read only access to these directories and/or files
	 * 	- &lt;project&gt;/macos/HelloWorld/AppDelegate.swift
	 * 	- &lt;project&gt;/macos/Podfile
	 * 	- node_modules directory lookup relatively from your project and global modules
	 * 	- Its own plugin directory
	 * 
	 * A plugin still can modify some provided template files such as `AppDelegate.swift` without asking your permission.
	 * It is recommended to check or audit your generated native project.
	 */
	plugins?: PluginRegistry,

	windows?: unknown, // TODO

}
