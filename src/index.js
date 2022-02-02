const fs = require('fs');
const { json_download, json_update } = require('./api/drive/drive');
const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const { token } = require('./data/config.json');

const bot = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
    ] 
});

async function send_log(msg) {
    let channels = [];
    let data = require('./data/data.json');
    await new Promise.all(Object.keys(data.guilds).map((guild) => {
        data.guilds[guild].log_channels.map(channel => channels.push(channel));
    }));
    channels.map(channel => {
        const log_channel = bot.channels.cache.get(channel);
        if (log_channel) {
            bot.channels.cache.get(channel).send(msg);
        }
    })

}

function stats_update(guild) {
    const data = require('./data/data.json');
    if (data.guilds[guild.id].stats) {
        const stats = data.guilds[guild.id].stats
        const all_channel = guild.channels.cache.get(stats.all_channel);
        const user_channel = guild.channels.cache.get(stats.user_channel);
        const bot_channel = guild.channels.cache.get(stats.bot_channel)

        if (!all_channel || !user_channel || !bot_channel) {
            delete data.guilds[guild.id].stats;
            json_update(data);
            return;
        }

        all_channel.setName(`린민전체-${guild.members.cache.size}`);
        user_channel.setName(`동무-${guild.members.cache.filter(m => !m.user.bot).size}`);
        bot_channel.setName(`로보트-${guild.members.cache.filter(m => m.user.bot).size}`);
    }
}

bot.commands = new Collection();
const files = fs.readdirSync('src/commands').filter(file => file.endsWith(".js"));

for (const file of files) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

bot.once('ready', async () =>  { 
    await json_download();
    bot.user.setActivity("테스트", { type: "PLAYING" });
    setInterval(schedule, 1000);
    setInterval(chanege_activity, 5000);
    console.log(`${bot.user.tag}로 로그인 함!`);
    let data = require('./data/data.json');
    await Promise.all(bot.guilds.cache.map((guild) => {
        if (!data.guilds[guild.id])
            data.guilds[guild.id] = { 
                target_channels: [], 
                log_channels: []
            }
    }));
    await Promise.all(Object.keys(data.guilds).map((guild) => {
        if (!bot.guilds.cache.find(g => g.id == guild))
            delete bot.guilds[guild];
    }))
    json_update(data);
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

bot.on('messageCreate', async (msg) =>{
    const emoji = msg.content.match(/<:\w+:\d+>/gi);
    const content = msg.content.replace(/<:\w+:\d+>/gi, '');
    if (emoji) {
        const emoji_id = emoji.map((e) => e.split(':')[2].match(/\d+/)[0]);
        await Promise.all(emoji_id.map((id) => {
            msg.guild.emojis.fetch(id)
                .then((emoji) => {
                    msg.channel.send({ embeds: [new MessageEmbed({
                        author: {
                            name: msg.member.displayName,
                            iconURL: msg.member.displayAvatarURL(),
                        },
                        image: { url: `${emoji.url}?size=1024`},
                        color: msg.member.displayHexColor,
                        description: (content) ? content : ""
                    })]});
                })
                .catch(console.error);
        }));
        msg.delete();
    }
});

bot.on('guildMemberAdd', async (member) => {
    stats_update(member.guild);
    const data = require('./data/data.json');
    if (data.guilds[member.guild.id].autorole) {
        const role = data.guilds[member.guild.id].autorole
        const bot_role = member.guild.roles.cache.get(role.bot_role);
        const user_role = member.guild.roles.cache.get(role.user_role);

        if (!bot_role || !user_role) { // 권한이 존재하는지 확인
            delete data.guilds[member.guild.id].autorole;
            json_update(data);
            return;
        }
        await member.roles.add((member.user.bot) ? bot_role : user_role);
    }
});

bot.on('guildMemberRemove', async (member) => {
    stats_update(member.guild);
});

const activity_list = ["테스트", "디버깅", "수리"];
let turn = 0    

function schedule() {
    const now = new Date();
    if (now.toTimeString().split('')[0] == "00:00:00") {
        const { gettoday } = require("./api/school/school");
        gettoday();
    }   
}

function chanege_activity() {
    bot.user.setActivity(activity_list[turn], { type: "PLAYING" });
    turn = (turn == 0) ? 1 : 0;
}

bot.login(token);

module.exports.send_log = send_log;