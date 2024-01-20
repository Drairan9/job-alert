import { Client, GatewayIntentBits } from 'discord.js';

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

	private async start() {
		await this.login(this.BOT_TOKEN);
	}
}