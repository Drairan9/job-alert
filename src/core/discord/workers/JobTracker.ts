import { Client, EmbedBuilder } from 'discord.js';
import TJob from '../../../types/Jobs';

export default class JobTracker {
	private readonly client: Client;
	private readonly INTERVAL: number = 60000 * 0.1;

	constructor(client: Client, callback: () => Promise<TJob[] | false>) {
		this.client = client;
		this.startWorker(callback);
	}

	private startWorker(callback: () => Promise<TJob[] | false>) {
		setInterval(async () => {
			const user = await this.client.users.fetch(process.env.OWNER_ID!);
			const newJobs = await callback();
			// if (newJobs) {
			// 	if (newJobs.length <= 0) return;
			// 	await user.send(':rotating_light: New job alert!');
			// 	newJobs.forEach((job) => {
			// 		const embed = new EmbedBuilder()
			// 			.setColor(0xef0808)
			// 			.setTitle(job.title)
			// 			.setURL(job.url)
			// 			.setAuthor({name: job.company})
			// 			.setFooter({text: job.website})
			// 			.addFields({
			// 				name: 'Salary',
			// 				value: job.salary
			// 			}, {
			// 				name: 'Tags',
			// 				value: job.tags.join(', ')
			// 			});
			// 		user.send({embeds: [embed]});
			// 	});
			// }
			// if (!newJobs) await user.send('Cannot fetch new jobs.');
		}, this.INTERVAL);
	}
}