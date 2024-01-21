import { Client } from 'discord.js';
import TJob from '../../../types/Jobs';

export default class JobTracker {
	private readonly client: Client;
	private readonly INTERVAL: number = 60000 * 30;

	constructor(client: Client, callback: () => Promise<TJob[] | false>) {
		this.client = client;
		this.startWorker(callback);
	}

	private startWorker(callback: () => Promise<TJob[] | false>) {
		setInterval(async () => {
			const user = await this.client.users.fetch(process.env.OWNER_ID!);
			const newJobs = await callback();
			if (newJobs) {
				if (newJobs.length <= 0) return;
				// TODO: Better messages
				newJobs.forEach((job) => {
					user.send(JSON.stringify(job));
				});
			}
			if (!newJobs) await user.send('Cannot fetch new jobs.');
		}, this.INTERVAL);
	}
}