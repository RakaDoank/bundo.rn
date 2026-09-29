export interface PodSpecSourceFromGit {
	gitUrl: string,
	revision?:
		| {
			branch: string,
		}
		| {
			tag: string,
		}
		| {
			commit: string,
		},
}
