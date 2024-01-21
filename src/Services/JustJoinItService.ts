import axios from 'axios';
import { load } from 'cheerio';
import TJob from '../types/Jobs';
import TempService from './TempService';

export default class JustJoinItService {
	private static readonly PAGE_URL = 'https://justjoin.it/all-locations/javascript/experience-level_junior/remote_yes?orderBy=DESC&sortBy=newest';

	static async getAllJobs(): Promise<TJob[] | false> {
		const web = await axios.get(this.PAGE_URL, {
			headers: {
				'sec-ch-ua-platform': '"Windows"',
			}
		});
		if (web.status !== 200) return false;

		const $ = load(web.data);

		return $('[data-test-id="virtuoso-item-list"] > div').map((_, item) => {
			return {
				website: 'JustJoinIt',
				title: $(item).find('.css-16gpjqw').text().trim(),
				salary: $(item).find('.css-1b2ga3v').text().trim().replace(/\.css-jmy9db\{[^}]*\}/, ''),
				company: $(item).find('.css-ldh1c9 > span').text().trim(),
				url: `https://justjoin.it/${$(item).find('.css-4lqp8g').attr('href')}`,
				tags: $(item).find('.css-1am4i4o').map((_, element) => $(element).text()).toArray(),
			};
		}).toArray();
	}

	static async getNewJobs(): Promise<TJob[] | false> {
		const temp = new TempService('justjoinit');
		const jobsfromTemp = await temp.readTempMem();

		const oldJobOffers = new Set(JSON.parse(jobsfromTemp).map((jobOffer: TJob) => jobOffer['url']));
		const latestJobOffers: TJob[] | false = await JustJoinItService.getAllJobs();
		if (!latestJobOffers) return false;

		temp.writeTempMem(JSON.stringify(latestJobOffers));
		return latestJobOffers.filter(job => !oldJobOffers.has(job['url']));
	}
}