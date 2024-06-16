import { TJob } from '../types/Jobs';
import crypto from 'crypto';

export function generateHashFromJobData(job: Pick<TJob, 'website' | 'title' | 'tags' | 'url'>): string {
	const sortedTagsChars: string = job.tags.join('').split('').sort().join(''); // Job tags may appear in diffrent order

	const jobOfferFingerprint: string =
		job.website.replace(/ /g, '') +
		job.title.replace(/ /g, '') +
		job.url.replace(/ /g, '') +
		sortedTagsChars.replace(/ /g, '');

	return crypto.createHash('sha256').update(jobOfferFingerprint).digest('hex');
}
