import type {
	PodDependencyFromCocoapods,
} from "./pod-dependency-from-cocoapods"

import type {
	PodDependencyFromGit,
} from "./pod-dependency-from-git"

import type {
	PodDependencyFromLocal,
} from "./pod-dependency-from-local"

export type PodDependency =
	| PodDependencyFromCocoapods
	| PodDependencyFromGit
	| PodDependencyFromLocal
