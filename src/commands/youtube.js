const { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu, Message  } = require("discord.js");
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel } = require("@discordjs/voice");
const { search_videos, search_video, get_list } = require('../api/youtube/youtube');
const { send_log } = require("../index");
const ytdl = require('ytdl-core');

const YOUTUBE_COLOR = "#ff0000"
let playlist = {};

function checkUrl(strUrl) {
    var expUrl = /^http[s]?\:\/\//i;
    return expUrl.test(strUrl);
}

function get_parameters(url) {
    const object = {};
    const splited = url.split("?");
    if (splited.length > 1) {
        const parameters = splited[1].split('&');
        parameters.map((p) => {
            const param = p.split('=');
            object[param[0]] = param[1];
        });
        return object;
    } else { return "no parameter" }
}

async function playlist_add(list_id, guild_id, target) {
    const toYoutube = (id) => `https://www.youtube.com/watch?v=${id}`
    const vids = await get_list(list_id);
    vids.map(async vid => {
        if (vid != target) {
            const vid_info = await ytdl.getInfo(toYoutube(vid)).catch(err => send_log(`[vid_info 가져오는 중 오류] ${err}`));
            if (!vid_info) return;
            const stream = ytdl(toYoutube(vid), { filter: 'audioonly', highWaterMark: 1 << 25 });
            playlist[guild_id].push({ 
                info: vid_info, 
                stream: stream
            });
        }
    });
}

async function play_embed(interaction, info, volume, loop, btn) {
    await interaction.editReply({ 
        content: "**Now Playing..**",
        embeds: [ new MessageEmbed({
            title: info.videoDetails.title,
            image: { url: info.videoDetails.thumbnails[3].url },
            color: YOUTUBE_COLOR,
            url: info.videoDetails.video_url,
            author: { name: info.videoDetails.ownerChannelName },
            description: `음량 : ${Math.floor(volume*10)} ${(loop == true) ? "| 루프" : ""}`,
        })],
        components: [btn]
    });
}

/** 
 * @param {CommandInteraction} interaction
 */

async function play_youtube(channel, interaction, vol, url) {
    await interaction.deferReply();

    const clear_play = () => {
        playlist[interaction.guild.id] = undefined;
        player.stop();
        collecter.stop();
        connection.disconnect();
        connection.destroy();
        interaction.deleteReply();
    };
    let volume = vol/10 || 1.0;
    let loop = false;

    const url_parameters = get_parameters(url);
    if (url_parameters == "no parameter") {
        await interaction.editReply("음.. 올바른 유튜브 링크가 아닌듯하네요");
        return;
    }

    let vid_info = await ytdl.getInfo(url).catch(async e => {
            await interaction.editReply("음.. 오디오를 재생할 수 없어요..");
        });
    if (!vid_info) return;

    if (!playlist[interaction.guild.id]) {
        playlist[interaction.guild.id] = [];
        playlist[interaction.guild.id].push({ info: vid_info, stream: ytdl(url, { filter: 'audioonly', highWaterMark: 1 << 25 }) });
        if (url_parameters.hasOwnProperty('list')) 
            playlist_add(url_parameters.list, interaction.guild.id, vid_info.videoDetails.videoId);
    } else {
        playlist[interaction.guild.id].push({ info: vid_info, stream: ytdl(url, { filter: 'audioonly', highWaterMark: 1 << 25 }) });
        if (url_parameters.hasOwnProperty('list')) {
            playlist_add(url_parameters.list, interaction.guild.id, vid_info.videoDetails.videoId);
            await interaction.editReply(`**${vid_info.videoDetails.title}에 포함된 플레이리스트** 가 리스트에 추가됨`);
        } else {
            await interaction.editReply(`**${vid_info.videoDetails.title}** (이)가 리스트에 추가됨`);
        }
        return;
    }   

    let btn = new MessageActionRow({
        components: [
            new MessageButton({ customId: "stop", label: "X", style: 'DANGER' }), 
            new MessageButton({ customId: "loop", emoji: "♻️", style: 'PRIMARY' }), 
            new MessageButton({ customId: "vol_up", emoji: "⬆️", style: 'SECONDARY', disabled: (volume < 1.0) ? false : true }), 
            new MessageButton({ customId: "vol_down", emoji: "⬇️", style: 'SECONDARY', disabled: (volume > 0.0) ? false : true }), 
            new MessageButton({ customId: "skip", emoji: "➡️", style: 'SUCCESS'})
        ]
    });
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    
    await play_embed(interaction, vid_info, volume, loop, btn);
    let resource = createAudioResource(playlist[interaction.guild.id][0].stream, { inlineVolume: true })
    resource.volume.setVolume(volume);
    const player = createAudioPlayer();
    player.play(resource);
    connection.subscribe(player);

    // 리스너
    const collecter = interaction.channel.createMessageComponentCollector();
    collecter.on('collect', async i => {
        switch(i.customId) {
            case "vol_up" :
                i.deferUpdate();
                resource.volume.setVolume(volume += 0.1);
                break;
            case "vol_down" :
                i.deferUpdate();
                resource.volume.setVolume(volume -= 0.1);
                break;
            case "stop" :
                i.deferUpdate();
                clear_play();
                return;
            case "loop" :
                i.deferUpdate();
                loop = (loop) ? false : true;
                break;
            case "skip" :
                i.deferUpdate();
                player.stop();
        }
        btn.components[2].setDisabled((volume < 1.0) ? false : true);
        btn.components[3].setDisabled((volume > 0.0) ? false : true);
        const info = playlist[interaction.guild.id][0].info;
        await play_embed(interaction, info, volume, loop, btn);
    });
    player.on(AudioPlayerStatus.Idle, async () => {
        if (loop == true) {
            resource = createAudioResource(ytdl(
                playlist[interaction.guild.id][0].info.videoDetails.video_url, 
                { filter: 'audioonly', highWaterMark: 1 << 25 }), 
                { inlineVolume: true });
            resource.volume.setVolume(volume);
            player.play(resource);
            return;
        }
        if (playlist[interaction.guild.id].length == 1) {
            clear_play();
        } else {
            playlist[interaction.guild.id].shift();
            const vid = playlist[interaction.guild.id][0];
            resource = createAudioResource(vid.stream, { inlineVolume: true });
            resource.volume.setVolume(volume);
            player.play(resource);
            await play_embed(interaction, vid.info, volume, loop, btn);
        }
    });
}

module.exports = {
    name: "youtube",
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const cmd_group = interaction.options.getSubcommandGroup(false) || "default";
        const sub_cmd = interaction.options.getSubcommand();
        if (cmd_group == "default") {
            const youtube_url = (vid) => (`https://www.youtube.com/watch?v=${vid}`);
            if (sub_cmd == "play") {
                const user_channel = interaction.guild.members.cache.get(interaction.user.id).voice.channel;
                if (!user_channel) {
                    await interaction.reply("먼저 채널에 입장해주세요");
                    return;
                }
                const word = interaction.options.getString("word");
                play_youtube(
                    user_channel,
                    interaction, 
                    interaction.options.getInteger("음량"), 
                    (checkUrl(word)) ? word 
                    : youtube_url((await search_video(word)
                        .catch(err => send_log(`[youtube search_video 오류] ${err}`))))
                );
            } else if (sub_cmd == "search") {
                const user_channel = interaction.guild.members.cache.get(interaction.user.id).voice.channel;
                if (!user_channel) {
                    await interaction.reply("먼저 채널에 입장해주세요");
                    return;
                }
                const word = interaction.options.getString("검색어");
                await interaction.deferReply({ ephemeral: true});
                const results = await search_videos(word)
                    .catch(err => send_log(`[youtube search_video 오류] ${err}`));
                const select_menu = new MessageActionRow({
                    components: [
                        new MessageSelectMenu({
                            customId: "select_vid",
                            placeholder: "원하는 영상을 선택하세요!",
                            options : results.map(result => ({ 
                                label: (result.title.length >= 100) ? `${result.title.substring(0, 95)}...` : result.title, 
                                value: result.vid_id 
                            }))
                        })
                    ]
                });
                await interaction.editReply({ content: `검색어 **[${word}]**의 결과 입니다.`, components: [select_menu]});
                const filter = (i) => { return i.user.id === interaction.user.id; };
                interaction.channel.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 })
                    .then(async _interaction => {
                        await interaction.editReply({ content: "성공!", components: [] });
                        play_youtube(user_channel, _interaction, interaction.options.getInteger("음량"), youtube_url(_interaction.values[0]));
                    })
                    .catch(async (err) => {
                        if (err) {
                            await interaction.editReply(({ content: "명령어가 만료되었습니다.", components: [] }));
                        }
                    });
            }
        } else if (cmd_group == "list") {
            if (sub_cmd == "show") {
                let content = "";
                let num = 1;
                (playlist[interaction.guild.id]) 
                ? playlist[interaction.guild.id].map(vid => { 
                    content += `**[${(num == 1) ? "현재 재생" : num-1}]** ${vid.info.videoDetails.title}\n`;
                    num++;
                }) : (content = "없음");
                await interaction.reply({ embeds: [new MessageEmbed({
                    title: `재생 리스트`,
                    description: content,
                    color: YOUTUBE_COLOR
                })]});
            } else if (sub_cmd == "del") {
                if (!playlist[interaction.guild.id]) {
                    await interaction.reply("현재 재생 대기중인 유튜브 리스트가 없습니다");
                    return;
                  
                } else {  
                    if (playlist[interaction.guild.id].length == 1) {
                        await interaction.reply("현재 재생 대기중인 유튜브 리스트가 없습니다");
                        return;
                    } else if (playlist[interaction.guild.id].length == 2) {
                        const deleted = playlist[interaction.guild.id].splice(1,1);
                        await interaction.reply(`**${deleted[0].info.videoDetails.title}** 을(를) 리스트에서 삭제했습니다.`);
                        return;
                    }
                }

                let options = []
                for (let i = 0; i < playlist[interaction.guild.id].length; i++) {
                    if (i == 0) continue;
                    options.push({ 
                        label: playlist[interaction.guild.id][i].info.videoDetails.title, 
                        value: i.toString() 
                    });
                }

                const select_menu = new MessageActionRow({
                    components: [
                        new MessageSelectMenu({
                            customId: "select_vid",
                            placeholder: "삭제할 영상을 선택하세요!",
                            options: options,
                        })
                    ]
                });
                await interaction.reply({ content: `아래는 현재 재생 대기중인 유튜브 리스트 입니다.`, components: [select_menu], ephemeral: true });
                const filter = (i) => { return i.user.id === interaction.user.id; };
                interaction.channel.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 })
                    .then(async _interaction => {
                        const deleted = playlist[interaction.guild.id].splice(parseInt(_interaction.values[0]), 1);
                        await interaction.editReply({ content: "성공!", components: [] });
                        await _interaction.channel.send(`**${deleted[0].info.videoDetails.title}** 을(를) 리스트에서 삭제했습니다.`);
                    })
                    .catch(async (err) => {
                        if (err) {
                            await interaction.editReply(({ content: "명령어가 만료되었습니다.", components: [] }));
                        }
                });
            }
        }
    },
};