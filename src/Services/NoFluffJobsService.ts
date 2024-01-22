import axios from 'axios';
import { load } from 'cheerio';
import TJob from '../types/Jobs';
import TempService from './TempService';

export default class NoFluffJobsService {
	private static readonly PAGE_URL = 'https://nofluffjobs.com/remote/JavaScript?page=1&criteria=seniority%3Dtrainee,junior&sort=newest';

	static async getAllJobs(): Promise<TJob[] | false> {
		const web = await axios.get(this.PAGE_URL, {
			headers: {
				'sec-ch-ua-platform': '"Windows"',
			}
		});
		if (web.status !== 200) {
			return false;
		}
		const $ = load(web.data);

		return $('[listname="search"] > .list-container.ng-star-inserted > [nfj-postings-item]').map((_, item) => {
			return {
				id: $(item).attr('id') ?? `https://nofluffjobs.com${$(item).attr('href')}`,
				website: 'NoFluffJobs',
				thumbnail: 'https://nofluffjobs.com/heroes/wp-content/themes/nofluffjobs-heroes/assets/images/logo_white.svg', // NoFluff makes separate request to grab the images and some tags
				title: $(item).find('[data-cy="title position on the job offer listing"]').text().trim() || 'No title',
				salary: $(item).find('[data-cy="salary ranges on the job offer listing"]').text().trim().replace('\n', ''),
				company: $(item).find('footer > h4').text().trim(),
				url: `https://nofluffjobs.com${$(item).attr('href')}`,
				tags: $(item).find('[data-cy="category name on the job offer listing"]').map((_, element) => $(element).text().trim()).toArray(),
			};
		}).toArray();
	}

	static async getNewJobs(): Promise<TJob[] | false> {
		const temp = new TempService('nofluffjobs');
		const jobsFromTemp = await temp.readTempMem();

		const oldJobOffers = new Set(JSON.parse(jobsFromTemp).map((jobOffer: TJob) => jobOffer['url']));
		const latestJobOffers: TJob[] | false = await NoFluffJobsService.getAllJobs();
		if (!latestJobOffers) return false;

		temp.writeTempMem(JSON.stringify(latestJobOffers));
		return latestJobOffers.filter(job => !oldJobOffers.has(job['url']));
	}
}