import {
	TurboModuleRegistry,
	type CodegenTypes,
	type TurboModule,
} from "react-native"

export interface Spec extends TurboModule {

	getTrafficLightStartInset(): CodegenTypes.Int32,

	isFullScreen(): boolean,

}

export default TurboModuleRegistry.getEnforcing<Spec>("BundoWindow")
