const { CommandInteraction, MessageEmbed } = require("discord.js");
const { json_update } = require("../api/drive/drive");

module.exports = {
    name: "stats",
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        let data = require("../data.json");
        const guild = interaction.guild;
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "상태") {
            if (data.guilds[guild.id].stats) {
                const stats = data.guilds[guild.id].stats;
                const embed = new MessageEmbed({
                    title: "서버 상태 기능",
                    fields: [ 
                        { name: "전체", value: `<#${stats.all_channel}>` },
                        { name: "유저", value: `<#${stats.user_channel}>` },
                        { name: "봇", value: `<#${stats.bot_channel}>`}
                    ],
                    color: interaction.guild.me.displayHexColor
                });
                await interaction.reply({ content: "서버 상태 기능이 활성화 되있으며, 설정 사항은 다음과 같습니다.", embeds: [embed]});
            } else {
                await interaction.reply("음.. 이 서버는 서버 상태 기능이 비활성화되있네요..");
            }
        } else if (subcommand === "활성화") {
            if (data.guilds[guild.id].stats) {
                await interaction.reply(`이미 서버 상태 기능이 활성화되있습니다`);
                return;
            }
            const all_members = guild.members.cache.size;
            const user_members = guild.members.cache.filter(m => !m.user.bot).size;
            const bot_members = guild.members.cache.filter(m => m.user.bot).size;

            const category = await guild.channels.create("보고사항", { type: 'GUILD_CATEGORY', position: 1});
            const everyone = interaction.guild.roles.cache.find(r => r.name === '@everyone');
            data.guilds[guild.id].stats = {
                category: category.id,
                all_channel: (await guild.channels.create(`전체-${all_members}`, { 
                    type: 'GUILD_TEXT', 
                    parent: category.id, 
                    position: 1, 
                    permissionOverwrites: [{id: everyone.id, deny: ['SEND_MESSAGES']}]
                })).id,
                user_channel: (await guild.channels.create(`고딩-${user_members}`, { 
                    type: 'GUILD_TEXT', 
                    parent: category.id, 
                    position: 2, 
                    permissionOverwrites: [{id: everyone.id, deny: ['SEND_MESSAGES']}]
                })).id,
                bot_channel: (await guild.channels.create(`로봇-${bot_members}`, { 
                    type: 'GUILD_TEXT', 
                    parent: category.id, 
                    position: 3, 
                    permissionOverwrites: [{id: everyone.id, deny: ['SEND_MESSAGES']}]
                })).id
            };
            json_update(data, 0);
            await interaction.reply("서버 상태 기능을 활성화 했습니다");
        } else if (subcommand === "비활성화") {
            if (!data.guilds[guild.id].stats) {
                await interaction.reply(`이미 서버 상태 기능이 비활성화되있습니다`);
                return;
            }

            await Promise.all(Object.values(data.guilds[guild.id].stats).map(channel_id => {
                const channel = guild.channels.cache.get(channel_id)
                if (channel) channel.delete();
            }));
            delete data.guilds[guild.id].stats
            json_update(data, 0);
            await interaction.reply("서버 상태 기능을 비활성화 했습니다");
        } else if (subcommand === "리셋") {
            if (!data.guilds[guild.id].stats) {
                await interaction.reply(`서버 상태 기능이 설정되있지않습니다.`);
            }

            const stats = data.guilds[guild.id].stats
            const all_channel = guild.channels.cache.get(stats.all_channel);
            const user_channel = guild.channels.cache.get(stats.user_channel);
            const bot_channel = guild.channels.cache.get(stats.bot_channel)
    
            if (!all_channel || !user_channel || !bot_channel) {
                delete data.guilds[guild.id].stats;
                json_update(data, 0);
                await interaction.reply("서버 상태 기능에 문제가 생겨 초기화를 하였습니다.\n추후에 다시 설정해주시기 바랍니다.");
                return;
            }
    
            all_channel.setName(`전체-${guild.members.cache.size}`);
            user_channel.setName(`고딩-${guild.members.cache.filter(m => !m.user.bot).size}`);
            bot_channel.setName(`로봇-${guild.members.cache.filter(m => m.user.bot).size}`);
            await interaction.reply(`서버 상태 기능이 리셋되었습니다`);
        }
    }
}