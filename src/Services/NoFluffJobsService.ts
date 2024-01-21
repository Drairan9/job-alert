import axios from 'axios';
import { load } from 'cheerio';
import TJob from '../types/Jobs';

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

		return $('[nfj-postings-item]').map((_, item) => {
			return {
				website: 'NoFluffJobs',
				title: $(item).find('[data-cy="title position on the job offer listing"]').text().trim(),
				salary: $(item).find('[data-cy="salary ranges on the job offer listing"]').text().trim().replace('\n', ''),
				company: $(item).find('footer > h4').text().trim(),
				url: `https://nofluffjobs.com${$(item).attr('href')}`,
				tags: $(item).find('[data-cy="category name on the job offer listing"]').map((_, element) => $(element).text().trim()).toArray(),
			};
		}).toArray();
	}
}