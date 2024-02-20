export type TJob = {
	id: string, // Don't care what is it. It just needs to be unique.
	website: string,
	thumbnail: string,
	title: string,
	salary: string,
	company: string,
	url: string,
	tags: string[],
};

export type TGetNewJobs = {
	jobs: TJob[] | null,
	isError: boolean,
	errorText: string,
	provider: string
}