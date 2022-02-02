const { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu  } = require("discord.js");
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel } = require("@discordjs/voice");
const { search_videos, search_video } = require('../api/youtube/youtube');
const ytdl = require('ytdl-core');

let playlist = {};

function checkUrl(strUrl) {
    var expUrl = /^http[s]?\:\/\//i;
    return expUrl.test(strUrl);
}

async function play_embed(interaction, info, volume, loop, btn) {
    await interaction.editReply({ 
        content: "**Now Playing..**",
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

/** 
 * @param {CommandInteraction} interaction
 */

async function play_youtube(channel, interaction, vol, url) {
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

    let vid_info = await ytdl.getInfo(url)
        .catch(async e => {
            await interaction.editReply("음.. 올바른 유튜브 링크가 아닌듯하네요");
            console.error(e);
            return;
        });

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
                volume += 0.1
                resource.volume.setVolume(volume);
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
                await i.deferUpdate();
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
        const subcommand = interaction.options.getSubcommand();
        if (subcommand == "play") {
            await interaction.deferReply();
            const user_channel = interaction.guild.members.cache.get(interaction.user.id).voice.channel;
            if (!user_channel) {
                await interaction.editReply("먼저 채널에 입장해주세요");
                return;
            }
            const word = interaction.options.getString("word");
            play_youtube(
                user_channel,
                interaction, 
                interaction.options.getInteger("음량"), 
                (checkUrl(word)) ? word : `https://www.youtube.com/watch?v=${(await search_video(word))}`
            );
        } else if (subcommand == "search") {
            const user_channel = interaction.guild.members.cache.get(interaction.user.id).voice.channel;
            if (!user_channel) {
                await interaction.editReply("먼저 채널에 입장해주세요");
                return;
            }
            const word = interaction.options.getString("검색어");
            await interaction.deferReply({ ephemeral: true});
            const results = await search_videos(word);
            let select_menu = new MessageActionRow({
                components: [
                    new MessageSelectMenu({
                        customId: "select_vid",
                        placeholder: "원하는 영상을 선택하세요!",
                        options : results.map(result => ({ 
                            label: (result.title.length >= 100)
                                ? `${result.title.substring(0, 95)}...`
                                : result.title, 
                            value: result.vid_id 
                        }))
                    })
                ]
            });
            await interaction.editReply({ content: `검색어 **[${word}]**의 결과 입니다.`, components: [select_menu]});
            const filter = i => { return i.user.id === interaction.user.id; };
            interaction.channel.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 })
                .then(async _interaction => {
                    await _interaction.deferReply();
                    play_youtube(user_channel, _interaction, interaction.options.getInteger("음량"), `https://www.youtube.com/watch?v=${_interaction.values[0]}`);
                })
                .catch(async (err) => {
                    if (err) {
                        await interaction.editReply(({ content: "명령어 사용시간이 만료되었습니다.", components: [] }));
                        console.error(err);
                    }
                });
        } else if (subcommand == "list") {
            let content = "";
            playlist[interaction.guild.id].map(vid => {content += `${vid.videoDetails.title}\n`;});
            await interaction.reply(`**아래는 재생 대기 중인 리스트 입니다.**\n${content}`);
        }
    },
};