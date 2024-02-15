import { Client, EmbedBuilder } from 'discord.js';
import TJob from '../../../types/Jobs';

export default class JobTracker {
	private readonly client: Client;
	private readonly INTERVAL: number = 60000 * 5; // Mins

	constructor(client: Client, callback: () => Promise<TJob[] | false>) {
		this.client = client;
		this.startWorker(callback);
	}

	private startWorker(callback: () => Promise<TJob[] | false>) {
		setInterval(async () => {
			const user = await this.client.users.fetch(process.env.OWNER_ID!);
			try {
				const newJobs = await callback();
				if (newJobs) {
					if (newJobs.length <= 0) return;
					await user.send('New job alert!');
					newJobs.forEach((job) => {
						const embed = new EmbedBuilder()
							.setColor(0x68c70f)
							.setTitle(job.title)
							.setURL(job.url)
							.setAuthor({name: job.company})
							.setThumbnail(job.thumbnail)
							.setFooter({text: job.website})
							.addFields({
								name: 'Salary',
								value: job.salary
							}, {
								name: 'Tags',
								value: job.tags.join(', ')
							});
						user.send({embeds: [embed]});
					});
				}
				if (!newJobs) await user.send('Cannot fetch new jobs.');
			} catch (e) {
				if (e instanceof Array) {
					e.forEach((error, index) => {
						user.send(`JobTracker multi exception ${index}: ${error.message}`);
					});
				} else {
					user.send(`JobTracker exception: ${e}`);
				}
			}
		}, this.INTERVAL);
	}
}