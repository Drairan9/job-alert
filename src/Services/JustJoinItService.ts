import axios from 'axios';
import { TJob, TGetNewJobs } from '../types/Jobs';
import TempService from './TempService';
import { TEmploymentType } from '../types/JustJoinIt';
import { generateHashFromJobData } from '../utils/hash';

export default class JustJoinItService {
	private static readonly PAGE_URL =
		'https://api.justjoin.it/v2/user-panel/offers?categories[]=1&experienceLevels[]=junior&remote=true&page=1&sortBy=newest&orderBy=DESC&perPage=100&salaryCurrencies=PLN';

	static async getAllJobs(): Promise<TJob[] | false> {
		const res = await axios.get(this.PAGE_URL, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
				'sec-ch-ua-platform': 'Windows',
				'sec-ch-ua-mobile': '?0',
				Accept: 'application/json, text/plain, */*',
				Referer: 'https://justjoin.it/',
				Version: '2',
			},
		});
		if (res.status !== 200) return false;

		const jobs: TJob[] = res.data.data.map((job: any) => {
			return {
				id: '',
				website: 'JustJoinIt',
				thumbnail: job.companyLogoThumbUrl,
				title: job.title,
				salary: this.minifyEmploymentTypes(job.employmentTypes),
				company: job.companyName,
				url: `https://justjoin.it/offers/${job.slug}`,
				tags: job.requiredSkills,
			};
		});

		return jobs.map((job) => {
			job.id = generateHashFromJobData(job);
			return job;
		});
	}

	static async getNewJobs(): Promise<TGetNewJobs> {
		try {
			const temp = new TempService('justjoinit');
			const jobsFromTemp = await temp.readTempMem();

			const oldJobOffers: Set<string> = new Set(JSON.parse(jobsFromTemp).map((jobOffer: TJob) => jobOffer['id'])); // I dont really remember why i did this in that way. It could just be an array and later be scanned with includes()

			const latestJobOffers: TJob[] | false = await JustJoinItService.getAllJobs();
			if (!latestJobOffers) throw new Error('getAllJobs() failed response status code check.');

			temp.writeTempMem(JSON.stringify(latestJobOffers));
			return {
				jobs: latestJobOffers.filter((job) => !oldJobOffers.has(job['id'])),
				isError: false,
				errorText: '',
				provider: 'JustJoinIt',
			};
		} catch (e) {
			return {
				jobs: null,
				isError: true,
				errorText: `JustJoinIt Service: ${e}`,
				provider: 'JustJoinIt',
			};
		}
	}

	/**
	 * Convert array of employment types to readable string.
	 **/
	private static minifyEmploymentTypes(employmentTypes: TEmploymentType[]): string {
		const minifiedEmpTypes = employmentTypes.map((employmentType) => {
			return `${employmentType.from} - ${employmentType.to} ${employmentType.currency} | ${employmentType.type}`;
		});
		return minifiedEmpTypes.join(', ');
	}
}
