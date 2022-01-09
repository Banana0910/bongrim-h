const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

let meal = "";
let calorie = "";

function embed(title, descirption) {
    const { MessageEmbed } = require('discord.js');
    return new MessageEmbed()
        .setTitle(title)
        .setDescription(descirption)
        .setColor("0x139BCC");
}

function getinformation() {
    const che = require('cheerio');
    const axios = require('axios');
        
    let html = await axios.get(`http://bongrim-h.gne.go.kr/bongrim-h/dv/dietView/selectDietDetailView.do?dietDate=2021/11/10`);

    const $ = che.load(html.data);
    meal = $("#subContent > div > div:nth-child(7) > div.BD_table > table > tbody > tr:nth-child(2) > td").html()
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/[0-9\\.]/gi, '')
        .trim(); // 봉림고는 괄호로 된 급식 기호가 없음
    calorie = $("#subContent > div > div:nth-child(7) > div.BD_table > table > tbody > tr:nth-child(4) > td").text().trim();
}

bot.once('ready', () => {
    console.log(`${bot.user.tag}로 로그인 함!`);
});

bot.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

    if (interaction.commandName === 'eval') {
        let cmd = interaction.options.getString("명령어");
        try { await interaction.reply(`명령 : \`${cmd}\`\n\`\`\`${eval(cmd).toString()}\`\`\``); }
        catch (e) { await interaction.reply(`명령 : \`${cmd}\`\n${e}`); }
    }
    else if (interaction.commandName === 'ping') {
        await interaction.reply('쿠쿠루***핑퐁***이다 ㅋㄹㅋㄹ')
    }
    else if (interaction.commandName === 'getinf') {
        getinformation();
        await interaction.reply("정보 수집 성공");
    }
    else if (interaction.commandName === 'show') {
        let date = new Date(2021, 11, 10);
        await interaction.reply({
            embeds: [embed(`${date.toString()}의 급식`, `${meal}\n\n**[칼로리 : ${calorie}]**`)]
        });
    }
});

bot.login(token);