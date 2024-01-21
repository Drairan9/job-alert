import DiscordBot from './discord/DiscordBot';
import { Events } from 'discord.js';
import NoFluffJobsService from '../Services/NoFluffJobsService';

export default class Application {
	private readonly discordBot: DiscordBot;

	constructor() {
		// this.discordBot = new DiscordBot(process.env.TOKEN!);
		new NoFluffJobsService().getAllJobs();
		// this.discordBot.once(Events.ClientReady, async (client) => {
		// 	console.log(`Connected ${client.user.displayName}`);
		//
		// 	const user = await this.discordBot.users.fetch('359775787693506571');
		// 	await user.send('Test');
		// });
	}
}