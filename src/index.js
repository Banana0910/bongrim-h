const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const { token } = require('./data/config.json');

const bot = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ] 
});

bot.commands = new Collection();
const commandFiles = fs.readdirSync('src/commands').filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

bot.once('ready', () =>  { 
    bot.user.setActivity("테스트", { type: "PLAYING" });
    setInterval(chanege_activity, 5000);
    console.log(`${bot.user.tag}로 로그인 함!`);
});

bot.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

    const command = bot.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
	}
});

const activity_list = ["테스트", "디버깅", "수리"];
let turn = 0    

function chanege_activity() {
    bot.user.setActivity(activity_list[turn], { type: "PLAYING" });
    turn = (turn == 0) ? 1 : 0;
}

bot.login(token);