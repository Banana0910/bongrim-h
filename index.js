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

async function getinformation() {
    const che = require('cheerio');
    const axios = require('axios');
    
    const date = new Date().toLocaleString("en", { year: "numeric",month: "2-digit", day: "numeric" }).split('/');
    const html = await axios.get(`http://bongrim-h.gne.go.kr/bongrim-h/dv/dietView/selectDietDetailView.do?dietDate=${date[2]}/${date[0]}/${date[1]}`);

    const $ = che.load(html.data);
    meal = $("#subContent > div > div:nth-child(7) > div.BD_table > table > tbody > tr:nth-child(2) > td").html()
        .replace(/<br\s*[\/]?>/gi, '\n') // <br> 태그를 줄바꿈으로
        .replace(/[0-9\\.]/gi, '') // 숫자랑 점들 전부 공백으로 바꾸기
        .trim(); // 봉림고는 괄호로 된 급식 기호가 없음 그렇기에 그냥 앞뒤 공백만 달리자
    calorie = $("#subContent > div > div:nth-child(7) > div.BD_table > table > tbody > tr:nth-child(4) > td").text().trim();
}

async function getschoolmeal(year,month,day) {
    const che = require('cheerio');
    const axios = require('axios');
    
    const html = await axios.get(`http://bongrim-h.gne.go.kr/bongrim-h/dv/dietView/selectDietDetailView.do?dietDate=${year}/${month}/${day}`);

    const $ = che.load(html.data);
    const meal = $("#subContent > div > div:nth-child(7) > div.BD_table > table > tbody > tr:nth-child(2) > td").html()
        .replace(/<br\s*[\/]?>/gi, '\n') // <br> 태그를 줄바꿈으로
        .replace(/[0-9\\.]/gi, '') // 숫자랑 점들 전부 공백으로 바꾸기
        .trim(); // 봉림고는 괄호로 된 급식 기호가 없음 그렇기에 그냥 앞뒤 공백만 달리자
    const calorie= $("#subContent > div > div:nth-child(7) > div.BD_table > table > tbody > tr:nth-child(4) > td").text().trim();
    return { meal: meal, calorie: calorie};
}

bot.once('ready', () =>  console.log(`${bot.user.tag}로 로그인 함!`));

bot.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

    if (interaction.commandName === 'eval') {
        const cmd = interaction.options.getString("명령어");
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
        const today = new Date().toLocaleString("en", { year: "numeric",month: "2-digit", day: "numeric" }).split('/');
        await interaction.reply({
            embeds: [embed(`${today[2]}년 ${today[0]}월 ${today[1]}일 급식`, `${(meal === "") ? "오늘은 급식이 없습니다" : meal}\n\n**[칼로리 : ${(calorie === "") ? "0 Kcal" : calorie}]**`)]
        });
    }
    else if (interaction.commandName === 'schoolmeal') {
        const year = interaction.options.getInteger("연").toString();
        const month = interaction.options.getInteger("월").toString().padStart(2,'0');
        const day = interaction.options.getInteger("일").toString().padStart(2,'0');

        const target_inf = await getschoolmeal(year,month,day);
        await interaction.reply({
            embeds: [embed(`${year}년 ${month}월 ${day}일 급식`, `${target_inf.meal}\n\n**[칼로리 : ${target_inf.calorie}]**`)]
        });
    }
});

bot.login(token);