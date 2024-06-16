import DiscordBot from './discord/DiscordBot';
import { Events } from 'discord.js';
import NoFluffJobsService from '../Services/NoFluffJobsService';
import JustJoinItService from '../Services/JustJoinItService';
import PracujPlService from '../Services/PracujPlService';

export default class Application {
	private readonly discordBot: DiscordBot;

	constructor() {
		this.discordBot = new DiscordBot(process.env.TOKEN!);

		this.discordBot.once(Events.ClientReady, async () => {
			console.log('Connected.');
			this.loadDiscordWorker();
		});
	}

	private loadDiscordWorker() {
		this.discordBot.trackJob(JustJoinItService.getNewJobs);
		this.discordBot.trackJob(NoFluffJobsService.getNewJobs);
		this.discordBot.trackJob(PracujPlService.getNewJobs);
	}
}
