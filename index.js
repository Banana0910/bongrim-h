const { Client, Intents, MessageEmbed, Message, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel } = require('@discordjs/voice');
const { token } = require('./config.json');

const bot = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ] 
});

let today_lunch = { meal: "", calorie: "" }
let today_dinner = { meal: "", calorie: "" }

let playlist = {};

async function play_embed(interaction, info, volume, loop, btn) {
    await interaction.editReply({ 
        embeds: [ new MessageEmbed({
            title: info.videoDetails.title,
            image: { url: info.videoDetails.thumbnails[3].url },
            color: "#ff0000",
            url: info.videoDetails.video_url,
            author: { name: info.videoDetails.ownerChannelName },
            description: `음량 : ${Math.floor(volume*10)} ${(loop == true) ? "| 루프" : ""}`,
        })],
        components: [btn]
    });
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
                meal: temp.html().trim()        
                .replace(/\n/gi, '')
                .replace(/<br\s*[\/]?>/gi, '\n')
                .replace(/[0-9\\.]/gi, ''),
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
            meal: $("#subContent > div > div:nth-child(7) > div:nth-child(5) > table > tbody > tr:nth-child(2) > td").html().trim()
                .replace(/\n/gi, '')
                .replace(/<br\s*[\/]?>/gi, '\n')
                .replace(/[0-9\\.]/gi, ''),
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
    } else if (interaction.commandName === 'play') {
        const user_channel = interaction.guild.members.cache.get(interaction.user.id).voice.channel;
        if (!user_channel) {
            await interaction.reply("먼저 채널에 입장해주세요");
            return;
        }

        const ytdl = require('ytdl-core');
        const url = interaction.options.getString("url");
        let vid_info = undefined;
        await interaction.deferReply();
        await ytdl.getInfo(url).then(async info => {
            vid_info = info;  
        }).catch(async e => {
            await interaction.editReply("음.. 올바른 유튜브 링크가 아닌듯하네요");
            return;
        })

        let volume = interaction.options.getInteger("음량");
        volume = (volume) ? volume/10 : 1.0
        if (!playlist[interaction.guild.id]) {
            playlist[interaction.guild.id] = [];
            playlist[interaction.guild.id].push({ info: vid_info, stream: ytdl(url, { filter: 'audioonly', highWaterMark: 1 << 25 }) });
        } else {
            playlist[interaction.guild.id].push({ info: vid_info, stream: ytdl(url, { filter: 'audioonly', highWaterMark: 1 << 25 }) });
            await interaction.editReply(`**${vid_info.videoDetails.title}** (이)가 리스트에 추가됨`);
            return;
        }

        let btn = new MessageActionRow({
            components: [
                new MessageButton({ customId: "stop", label: "X", style: 'DANGER' }), 
                new MessageButton({ customId: "loop", emoji: "♻️", style: 'PRIMARY' }), 
                new MessageButton({ customId: "vol_up", emoji: "⬆️", style: 'SECONDARY', disabled: (volume < 1.0) ? false : true }), 
                new MessageButton({ customId: "vol_down", emoji: "⬇️", style: 'SECONDARY', disabled: (volume > 0.1) ? false : true }), 
                new MessageButton({ customId: "skip", emoji: "➡️", style: 'SUCCESS'})
            ]
        });
        const connection = joinVoiceChannel({
            channelId: user_channel.id,
            guildId: user_channel.guild.id,
            adapterCreator: user_channel.guild.voiceAdapterCreator,
        });
        let loop = false;
        
        await play_embed(interaction, vid_info, volume, loop, btn);
        let resource = createAudioResource(playlist[interaction.guild.id][0].stream, { inlineVolume: true });
        const player = createAudioPlayer();
        player.play(resource);
        connection.subscribe(player);

        // 리스너
        const collecter = interaction.channel.createMessageComponentCollector();
        collecter.on('collect', async i => {
            i.deferUpdate();
            if (i.customId === "vol_up") {
                volume += 0.1
                resource.volume.setVolume(volume)
            } else if (i.customId === "vol_down") {
                volume -= 0.1
                resource.volume.setVolume(volume)
            } else if (i.customId === "stop") {
                playlist[interaction.guild.id] = undefined;
                player.stop();
                collecter.stop();
                connection.disconnect();
                connection.destroy();
                interaction.deleteReply();
                return;
            } else if (i.customId === "loop") {
                loop = (loop == true) ? false : true;
            } else if (i.customId === "skip") {
                player.stop();
            }
            btn.components[2].setDisabled((volume < 1.0) ? false : true)
            btn.components[3].setDisabled((volume > 0.0) ? false : true)
            const info = playlist[interaction.guild.id][0].info;
            await play_embed(interaction, info, volume, loop, btn);
        });
        player.on(AudioPlayerStatus.Idle, async () => {
            if (loop == true) {
                resource = createAudioResource(ytdl(
                    playlist[interaction.guild.id][0].info.videoDetails.video_url, 
                    { filter: 'audioonly', highWaterMark: 1 << 25 }), 
                    { inlineVolume: true });
                player.play(resource);
                return;
            }
            if (playlist[interaction.guild.id].length == 1) {
                playlist[interaction.guild.id] = undefined;
                player.stop();
                collecter.stop();
                connection.disconnect();
                connection.destroy();
                interaction.deleteReply();
            } else {
                playlist[interaction.guild.id].shift();
                const vid = playlist[interaction.guild.id][0];
                resource = createAudioResource(vid.stream, { inlineVolume: true });
                player.play(resource);
                const info = vid.info
                await play_embed(interaction, info, volume, loop, btn);
            }
        });

    } else if (interaction.commandName === 'clean') {
        const count = interaction.options.getInteger("양");
        await interaction.channel.bulkDelete(count);
        await interaction.reply(`${count}만큼의 채팅을 삭제했음!`);
    }
});

const activity_list = ["테스트", "디버깅", "수리"];
let turn = 0    

function chanege_activity() {
    bot.user.setActivity(activity_list[turn], { type: "PLAYING" });
    turn = (turn == 0) ? 1 : 0;
}

bot.login(token);