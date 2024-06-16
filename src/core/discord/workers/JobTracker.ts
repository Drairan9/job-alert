import { Client, EmbedBuilder } from 'discord.js';
import { TGetNewJobs, TJob } from '../../../types/Jobs';

export default class JobTracker {
	private readonly client: Client;
	private readonly INTERVAL: number = 60000 * 5; // Mins

	constructor(client: Client, callback: () => Promise<TGetNewJobs>) {
		this.client = client;
		this.startWorker(callback);
	}

	private startWorker(getNewJobs: () => Promise<TGetNewJobs>) {
		setInterval(async () => {
			try {
				const user = await this.client.users.fetch(process.env.OWNER_ID!);
				const newJobs = await getNewJobs();
				if (newJobs.isError) {
					return await user.send(`JobTracker ${newJobs.provider} exception: ${newJobs.errorText}`);
				}
				if (newJobs.jobs === null) {
					return await user.send(`JobTracker ${newJobs.provider} exception: Jobs array is null.`);
				}
				if (newJobs.jobs.length <= 0) return;

				await user.send('New job alert!');
				newJobs.jobs.forEach((job: TJob) => {
					const embed = new EmbedBuilder()
						.setColor(0x68c70f)
						.setTitle(job.title)
						.setURL(job.url)
						.setAuthor({ name: job.company })
						.setThumbnail(job.thumbnail)
						.setFooter({ text: job.website })
						.addFields(
							{
								name: 'Salary',
								value: job.salary,
							},
							{
								name: 'Tags',
								value: job.tags.join(', '),
							}
						);
					user.send({ embeds: [embed] });
				});
			} catch (e) {
				const user = await this.client.users.fetch(process.env.OWNER_ID!);
				user.send(`${e}`);
			}
		}, this.INTERVAL);
	}
}
