import { Client, GatewayIntentBits } from 'discord.js';
import JobTracker from './workers/JobTracker';
import { TGetNewJobs } from '../../types/Jobs';

export default class DiscordBot extends Client {
	private readonly BOT_TOKEN;

	constructor(token: string) {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.DirectMessages
			]
		});
		this.BOT_TOKEN = token;

		this.start();
	}

	public trackJob(callback: () => Promise<TGetNewJobs>) {
		new JobTracker(this, callback);
	}

	private async start() {
		return await this.login(this.BOT_TOKEN);
	}
}