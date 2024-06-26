import axios from 'axios';
import { CheerioAPI, Element, load } from 'cheerio';
import { TGetNewJobs, TJob } from '../types/Jobs';
import TempService from './TempService';
import { generateHashFromJobData } from '../utils/hash';

export default class PracujPlService {
	private static readonly PAGE_URL =
		'https://it.pracuj.pl/praca/praca%20zdalna;wm,home-office?et=1%2C17&sc=0&itth=33';

	static async getAllJobs(): Promise<TJob[] | false> {
		const web = await axios.get(this.PAGE_URL, {
			headers: {
				'sec-ch-ua-platform': '"Windows"',
			},
		});
		if (web.status !== 200) return false;

		const $ = load(web.data);

		const jobs: TJob[] = $('[data-test="default-offer"]')
			.map((_, item) => {
				return {
					id: $(item).attr('data-test-offerid') ?? this.extractJobUrl($, item),
					website: 'PracujPl',
					thumbnail:
						$(item).find('[data-test="link-company-profile"] > picture > img').attr('src') ||
						'https://i.gpcdn.pl/2.0.0.216/images/logo-share-pracuj.jpg',
					title: this.extractJobTitle($, item) || 'No title',
					salary: this.extractJobSalary($, item),
					company: $(item)
						.find('.hide-on-desktop.tiles_cegq0mb')
						.find('[data-test="text-company-name"]')
						.text()
						.trim(),
					url: this.extractJobUrl($, item),
					tags: $(item)
						.find('[data-test="technologies-item"]')
						.map((_, element) => $(element).text())
						.toArray(),
				};
			})
			.toArray();

		return jobs.map((job) => {
			job.id = generateHashFromJobData(job);
			return job;
		});
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

	static async getNewJobs(): Promise<TGetNewJobs> {
		try {
			const temp = new TempService('pracujpl');
			const jobsFromTemp = await temp.readTempMem();

			const oldJobOffers = new Set(JSON.parse(jobsFromTemp).map((jobOffer: TJob) => jobOffer['id']));
			const latestJobOffers: TJob[] | false = await PracujPlService.getAllJobs();
			if (!latestJobOffers) throw new Error('getAllJobs() failed response status code check.');
			temp.writeTempMem(JSON.stringify(latestJobOffers));

			return {
				jobs: latestJobOffers.filter((job) => !oldJobOffers.has(job['id'])),
				isError: false,
				errorText: '',
				provider: 'PracujPL',
			};
		} catch (e) {
			return {
				jobs: null,
				isError: true,
				errorText: `PracujPL Service: ${e}`,
				provider: 'PracujPL',
			};
		}
	}
}
