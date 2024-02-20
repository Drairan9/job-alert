import axios from 'axios';
import { TJob, TGetNewJobs } from '../types/Jobs';
import TempService from './TempService';
import { TEmploymentType } from '../types/JustJoinIt';

export default class JustJoinItService {
	private static readonly PAGE_URL = 'https://api.justjoin.it/v2/user-panel/offers?categories[]=1&experienceLevels[]=junior&remote=true&page=1&sortBy=newest&orderBy=DESC&perPage=100&salaryCurrencies=PLN';

	static async getAllJobs(): Promise<TJob[] | false> {
		const res = await axios.get(this.PAGE_URL, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
				'sec-ch-ua-platform': 'Windows',
				'sec-ch-ua-mobile': '?0',
				'Accept': 'application/json, text/plain, */*',
				'Referer': 'https://justjoin.it/',
				'Version': '2'
			}
		});
		if (res.status !== 200) return false;

		return res.data.data.map((job: any) => {
			return {
				id: job.slug,
				website: 'JustJoinIt',
				thumbnail: job.companyLogoThumbUrl,
				title: job.title,
				salary: this.minifyEmploymentTypes(job.employmentTypes),
				company: job.companyName,
				url: `https://justjoin.it/offers/${job.slug}`,
				tags: job.requiredSkills,
			};
		});
	}

	static async getNewJobs(): Promise<TGetNewJobs> {
		try {
			const temp = new TempService('justjoinit');
			const jobsFromTemp = await temp.readTempMem();

			const oldJobOffers = new Set(JSON.parse(jobsFromTemp).map((jobOffer: TJob) => jobOffer['url']));
			const latestJobOffers: TJob[] | false = await JustJoinItService.getAllJobs();
			if (!latestJobOffers) throw new Error('getAllJobs() failed response status code check.');

			temp.writeTempMem(JSON.stringify(latestJobOffers));
			return {
				jobs: latestJobOffers.filter(job => !oldJobOffers.has(job['url'])),
				isError: false,
				errorText: '',
				provider: 'JustJoinIt'
			};
		} catch (e) {
			return {
				jobs: null,
				isError: true,
				errorText: `JustJoinIt Service: ${e}`,
				provider: 'JustJoinIt'
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