import axios from 'axios';
import { CheerioAPI, Element, load } from 'cheerio';
import TJob from '../types/Jobs';

export default class PracujPlService {
	private static readonly PAGE_URL = 'https://it.pracuj.pl/praca/praca%20zdalna;wm,home-office?et=1%2C17&sc=0&itth=33';

	static async getAllJobs(): Promise<TJob[] | false> {
		const web = await axios.get(this.PAGE_URL, {
			headers: {
				'sec-ch-ua-platform': '"Windows"',
			}
		});
		if (web.status !== 200) return false;

		const $ = load(web.data);

		return $('[data-test="default-offer"]').map((_, item) => {
			return {
				website: 'PracujPl',
				title: this.extractJobTitle($, item),
				salary: this.extractJobSalary($, item),
				company: $(item).find('[data-test="text-company-name"]').text().trim(),
				url: this.extractJobUrl($, item),
				tags: $(item).find('[data-test="technologies-item"]').map((_, element) => $(element).text()).toArray(),
			};
		}).toArray();
	}

	private static extractJobTitle($: CheerioAPI, item: Element) {
		// Super offers are treated differently (xd)
		const defaultTitle = $(item).find('[data-test="offer-title"] > a').text().trim();
		if (defaultTitle === '') {
			return $(item).find('[data-test="offer-title"]').text().trim();
		}

		return defaultTitle;
	}

	private static extractJobSalary($: CheerioAPI, item: Element) {
		const salary = $(item).find('[data-test="offer-salary"]').text().trim();
		if (salary === '' || !salary) return 'Undisclosed Salary';
		return salary;
	}

	// Jobs with multiple locations use javascript to create url. idc enough
	private static extractJobUrl($: CheerioAPI, item: Element): string {
		const url = $(item).find('[data-test="link-offer"]').attr('href');
		const companyUrl = $(item).find('[data-test="link-company-profile"]').attr('href');
		if (url === undefined) {
			return companyUrl ? companyUrl : 'NO URL';
		}
		return url;
	}
}