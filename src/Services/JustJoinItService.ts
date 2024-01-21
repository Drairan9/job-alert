import axios from 'axios';
import { load } from 'cheerio';
import TJob from '../types/Jobs';

export default class JustJoinItService {
	private static readonly PAGE_URL = 'https://justjoin.it/katowice/javascript';

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

	static async getNewJobs() {

	}
}