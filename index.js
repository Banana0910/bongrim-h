const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

let today_lunch = { 
    meal: "",
    calorie: ""
}
let today_dinner = {
    meal: "",
    calorie: "",
}

let target_channel = undefined;

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
    const date = new Date().toLocaleString("en", { year: "numeric", month: "2-digit", day: "numeric" }).split('/');
    
    try {
        const html = await axios.get(`http://bongrim-h.gne.go.kr/bongrim-h/dv/dietView/selectDietDetailView.do?dietDate=${date[2]}/${date[0]}/${date[1]}`);
        const $ = che.load(html.data);
        today_lunch = {
            meal: $("#subContent > div > div:nth-child(7) > div:nth-child(5) > table > tbody > tr:nth-child(2) > td").html().replace(/<br\s*[\/]?>/gi, '\n').replace(/[0-9\\.]/gi, '').trim(),
            calorie: $("#subContent > div > div:nth-child(7) > div:nth-child(5) > table > tbody > tr:nth-child(4) > td").text().trim()
        }
        const temp = $("#subContent > div > div:nth-child(7) > div:nth-child(6) > table > tbody > tr:nth-child(2) > td");
        if (temp.length) {
            today_dinner = {
                meal: temp.html().replace(/<br\s*[\/]?>/gi, '\n').replace(/[0-9\\.]/gi, '').trim(),
                calorie: $("#subContent > div > div:nth-child(7) > div:nth-child(6) > table > tbody > tr:nth-child(4) > td").text().trim()
            }
        }
    } catch (e) {
        console.error(e);
    }
}

async function getschoolmeal(year,month,day) {
    let lunch = { meal: undefined, calorie: undefined };
    let dinner = { meal: undefined, calorie: undefined };

    const che = require('cheerio');
    const axios = require('axios');
    
    try {
        const html = await axios.get(`http://bongrim-h.gne.go.kr/bongrim-h/dv/dietView/selectDietDetailView.do?dietDate=${year}/${month}/${day}`);
        const $ = che.load(html.data);
        
        lunch = {
            meal: $("#subContent > div > div:nth-child(7) > div:nth-child(5) > table > tbody > tr:nth-child(2) > td").html().trim().replace(/\n/gi, '').replace(/<br\s*[\/]?>/gi, '\n').replace(/[0-9\\.]/gi, ''),
            calorie: $("#subContent > div > div:nth-child(7) > div:nth-child(5) > table > tbody > tr:nth-child(4) > td").text().trim()
        }
        const temp = $("#subContent > div > div:nth-child(7) > div:nth-child(6) > table > tbody > tr:nth-child(2) > td");
        if (temp.length) {
            dinner = {
                meal: temp.html().replace(/<br\s*[\/]?>/gi, '\n').replace(/[0-9\\.]/gi, '').trim(),
                calorie: $("#subContent > div > div:nth-child(7) > div:nth-child(6) > table > tbody > tr:nth-child(4) > td").text().trim()
            }
        }
    } catch (e) {
        console.error(e);
    }
    return { lunch: lunch, dinner: dinner };
}

bot.once('ready', () =>  {
    bot.user.setActivity("테스트", { type: "PLAYING" });
    setInterval(chanege_activity, 5000);
    console.log(`${bot.user.tag}로 로그인 함!`);
});

bot.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

    if (interaction.commandName === 'set') {
        let channel = interaction.options.getChannel("채널");
        if (channel == null) channel = interaction.channel;
        target_channel = channel.id;
        await interaction.reply(`채널 ${channel.name}으로 설정되었습니다`);
    }
    else if (interaction.commandName === 'eval') {
        const cmd = interaction.options.getString("명령어");
        try { await interaction.reply(`명령 : \`${cmd}\`\n\`\`\`${eval(cmd).toString()}\`\`\``); }
        catch (e) { await interaction.reply(`명령 : \`${cmd}\`\n${e}`); }
    }
    else if (interaction.commandName === 'getinf') {
        await interaction.reply("정보 수집 중..");
        await getinformation();
        await interaction.editReply("정보 수집 성공");
    }
    else if (interaction.commandName === 'show') {
        const today = new Date().toLocaleString("en", { year: "numeric",month: "2-digit", day: "numeric" }).split('/');
        const { MessageEmbed } = require('discord.js');
        const embed = new MessageEmbed().setTitle(`${today[2]}년 ${today[0]}월 ${today[1]}일 급식`).setColor("0x139BCC");
        if (today_lunch.meal != undefined) {
            embed.addField("──────────────\n중식 (Lunch)\n──────────────", `${today_lunch.meal}\n**[칼로리 : ${today_lunch.calorie}]**\n`);
            if (today_dinner.meal != undefined) {
                embed.addField("──────────────\n석식 (Dinner)\n──────────────", `${today_dinner.meal}\n**[칼로리 : ${today_dinner.calorie}]**`);
            }
        }
        else {
            embed.setDescription("오늘은 급식이 없네요");
        }
        await interaction.reply({ embeds: [embed] });
    }
    else if (interaction.commandName === 'schoolmeal') {
        const year = interaction.options.getInteger("연").toString();
        const month = interaction.options.getInteger("월").toString().padStart(2,'0');
        const day = interaction.options.getInteger("일").toString().padStart(2,'0');

        await interaction.reply(`${year}년 ${month}월 ${day}일 급식을 가져오는 중..`);

        const target_inf = await getschoolmeal(year,month,day);
        if (target_inf.lunch.meal != undefined) {
            const { MessageEmbed } = require('discord.js');
            const embed = new MessageEmbed().setTitle(`${year}년 ${month}월 ${day}일 급식`).setColor("0x139BCC");
            embed.addField("──────────────\n중식 (Lunch)\n──────────────", `${target_inf.lunch.meal}\n**[칼로리 : ${target_inf.lunch.calorie}]**`,true);
            if (target_inf.dinner.meal != undefined) {
                embed.addField("──────────────\n석식 (Dinner)\n──────────────", `${target_inf.dinner.meal}\n**[칼로리 : ${target_inf.dinner.calorie}]**`, true);
            }
            await interaction.editReply({ content: "성공!", embeds: [embed] });
        } else {
            await interaction.editReply(`${year}년 ${month}월 ${day}일에는 급식이 없네요..`);
        }
    }
});

const activity_list = ["테스트", "자살"];
let turn = 0

function chanege_activity() {
    bot.user.setActivity(activity_list[turn], { type: "PLAYING" });
    if (turn == 1) {
        turn = 0;
    } else {
        turn = 1;
    }
}

bot.login(token);