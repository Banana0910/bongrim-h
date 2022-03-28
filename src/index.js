// 모듈 정의
async function send_log(msg) {
    let channels = [];
    let data = require('./data/data.json');
    await Promise.all(Object.keys(data.guilds).map((guild) => {
        data.guilds[guild].log_channels.map(channel => channels.push(channel));
    }));
    channels.map(channel => {
        const log_channel = bot.channels.cache.get(channel);
        if (log_channel)
            log_channel.send(msg);
    });
}

module.exports.send_log = send_log;

//index 시작
const fs = require('fs');
const { json_download, json_update } = require('./api/drive/drive');
const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const { scheduleJob } = require('node-schedule');
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

function stats_update(guild) {
    try {
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
    
            all_channel.setName(`전체-${guild.members.cache.size}`);
            user_channel.setName(`고딩-${guild.members.cache.filter(m => !m.user.bot).size}`);
            bot_channel.setName(`로봇-${guild.members.cache.filter(m => m.user.bot).size}`);
        }
    } catch(e) { send_log(`[서버 스텟 리셋 중 오류] ${err}`); }
}

function getinf() {
    const { gettoday } = require('./api/school/school');
    gettoday().catch(err => send_log(`[자동 또는 시작 gettoday 중 오류] ${err}`));
}

bot.commands = new Collection();
const files = fs.readdirSync('src/commands').filter(file => file.endsWith(".js"));

for (const file of files) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

bot.once('ready', async () =>  { 
    try {
        await json_download();
        const now = new Date();
        setInterval(chanege_activity, 5000);
        console.log(`${bot.user.tag} 로그인 함!`);
        bot.user.setActivity(`정비`, { type: "PLAYING" });
        await send_log(`**┌─── [${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}] 봇 시작 ───┐**`);
        getinf();
        let data = require('./data/data.json');
        await Promise.all(bot.guilds.cache.map((guild) => {
            if (!data.guilds[guild.id])
                data.guilds[guild.id] = { log_channels: [] };
        }));
        await Promise.all(Object.keys(data.guilds).map((guild) => {
            if (!bot.guilds.cache.find(g => g.id == guild))
                delete data.guilds[guild];
        }))
        json_update(data);
        scheduleJob("0 0 0 * * *", getinf); // 매일 00시 00분 00초에 gettoday 실행
    } catch(e) {
        console.error(e);
        bot.destroy();
        process.exit();
    }
});

bot.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
    const command = bot.commands.get(interaction.commandName);
	if (!command) return;
	try { await command.execute(interaction); }
	catch (e) { console.error(e); }
});

bot.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;
    try {
        const emoji = msg.content.match(/<:\w+:\d+>/gi);
        const content = msg.content.replace(/<:\w+:\d+>/gi, '');
        if (emoji) {
            const message = msg;
            const emoji_id = emoji.map((e) => e.split(':')[2].match(/\d+/)[0]);
            await Promise.all(emoji_id.map(async (id) => {
                const emoji = message.guild.emojis.cache.get(id);
                if (emoji) {
                    msg.delete();
                    await message.channel.send({ embeds: [new MessageEmbed({
                        author: { name: message.member.displayName, iconURL: message.member.displayAvatarURL() },
                        image: { url: `${emoji.url}?size=1024`},
                        color: message.member.displayHexColor,
                        description: (content) ? content : ""
                    })]});
                }
            }));
        }
    } catch(e) { send_log(`[이모지 확대 중 오류] ${e}`); }

    // try {
    //     let data = require('../src/data/data.json');
    //     if (data.guilds[msg.guild.id].levels) {
    //         const now = new Date().getTime();
    //         const user = data.guilds[msg.guild.id].levels[msg.author.id];
    //         if (now - user.cool >= 60000) {
    //             data.guilds[msg.guild.id].levels[msg.author.id].cool = now;
    
    //             const xp = Math.floor(Math.random()*10)+15;
    //             data.guilds[msg.guild.id].levels[msg.author.id].exp += xp;
    //             data.guilds[msg.guild.id].levels[msg.author.id].msg += 1;
                
    //             const next_xp = (user_level.level*(110+10*(user_level.level-1))/2)+100

    //             if (data.guilds[msg.guild.id].levels[msg.author.id].msg >= next_xp) {
    //                 await msg.channel.send(`<@${msg.author.id}>님, 레벨 ${++data.guilds[msg.guild.id].levels[msg.author.id].level}를 달성하신 것을 축하드립니다!`);
    //             }
    //             json_update(data);
    //         }
    //     }
    // } catch(e) { send_log(`[레벨링 중 오류] ${e}`)}
});

bot.on('guildMemberAdd', async (member) => {
    stats_update(member.guild);
    try {
        let data = require('./data/data.json');
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

        if (data.guilds[member.guild.id].levels) {
            data.guilds[member.guild.id].levels[member.id] = { 
                level: 0, 
                msg: 0, 
                exp: 0, 
                cool: new Date().getTime()-60000 
            },
            json_update(data);
        }
    } catch(e) { send_log(`[멤버 입장 처리 중 오류] ${err}`) }
});

bot.on('guildMemberRemove', async (member) => {
    stats_update(member.guild);
});

bot.on('guildCreate', async (guild) => {
    let data = require('./data/data.json');
    data.guilds[guild.id] = { log_channels: [] }
    json_update(data);
});

bot.on('guildDelete', async (guild) => {
    let data = require('./data/data.json');
    delete data.guilds[guild.id];
});

// const activity_list = ["테스트", "디버깅", "수리"];
// let turn = 0;

// function chanege_activity() {
//     bot.user.setActivity(activity_list[turn], { type: "PLAYING" });
//     turn = (turn == 0) ? 1 : 0;
// }

//only heroku
function chanege_activity() {
    const now = new Date();
    const enter_day = new Date("2022-03-02");
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days_ago = Math.ceil((today-enter_day)/(1000 * 3600 * 24))+1;
    bot.user.setActivity(`입학 ${days_ago}일차`, { type: "WATCHING" });
}

bot.login(token);