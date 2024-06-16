import axios from 'axios';
import { load } from 'cheerio';
import { TGetNewJobs, TJob } from '../types/Jobs';
import TempService from './TempService';
import { generateHashFromJobData } from '../utils/hash';

export default class NoFluffJobsService {
	private static readonly PAGE_URL =
		'https://nofluffjobs.com/remote/JavaScript?page=1&criteria=seniority%3Dtrainee,junior&sort=newest';

	static async getAllJobs(): Promise<TJob[] | false> {
		const web = await axios.get(this.PAGE_URL, {
			headers: {
				'sec-ch-ua-platform': '"Windows"',
			},
		});
		if (web.status !== 200) {
			return false;
		}
		const $ = load(web.data);

		const jobs: TJob[] = $('[listname="search"] > .list-container.ng-star-inserted > [nfj-postings-item]')
			.map((_, item) => {
				return {
					id: $(item).attr('id') ?? `https://nofluffjobs.com${$(item).attr('href')}`,
					website: 'NoFluffJobs',
					thumbnail: 'https://pbs.twimg.com/profile_images/1437396462472777730/-DDmmM6v_400x400.jpg', // NoFluff makes separate request to grab the images and some tags
					title:
						$(item).find('[data-cy="title position on the job offer listing"]').text().trim() || 'No title',
					salary: $(item)
						.find('[data-cy="salary ranges on the job offer listing"]')
						.text()
						.trim()
						.replace('\n', ''),
					company: $(item).find('footer > h4').text().trim(),
					url: `https://nofluffjobs.com${$(item).attr('href')}`,
					tags: $(item)
						.find('[data-cy="category name on the job offer listing"]')
						.map((_, element) => $(element).text().trim())
						.toArray(),
				};
			})
			.toArray();

		return jobs
			.map((job) => {
				job.id = generateHashFromJobData(job);
				return job;
			})
			.filter((job) => job.id != '2f75fea9e1b4cc94a7957208e48dbf04d37bbe77dd5e0627adf7b0c64a41bcb8'); // Nofluff has literally bugged job offer? If thats intentional on their site, its super funny.
	}

	static async getNewJobs(): Promise<TGetNewJobs> {
		try {
			const temp = new TempService('nofluffjobs');
			const jobsFromTemp = await temp.readTempMem();

			const oldJobOffers: Set<string> = new Set(JSON.parse(jobsFromTemp).map((jobOffer: TJob) => jobOffer['id']));
			const latestJobOffers: TJob[] | false = await NoFluffJobsService.getAllJobs();
			if (!latestJobOffers) throw new Error('getAllJobs() failed response status code check.');

			temp.writeTempMem(JSON.stringify(latestJobOffers));

			return {
				jobs: latestJobOffers.filter((job) => !oldJobOffers.has(job['id'])),
				isError: false,
				errorText: '',
				provider: 'NoFluffJobs',
			};
		} catch (e) {
			return {
				jobs: null,
				isError: true,
				errorText: `NoFluffJobs Service: ${e}`,
				provider: 'NoFluffJobs',
			};
		}
	}
}
