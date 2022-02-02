const { CommandInteraction } = require("discord.js");
const { json_update } = require("../api/drive/drive");

module.exports = {
    name: "stats",
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        let data = require("../data/data.json");
        const guild = interaction.guild;
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "상태") {
            await interaction.reply((data.guilds[guild.id].stats) 
                ? `음.. 이 서버는 서버 상태 기능이 활성화되있네요!` 
                : `음.. 이 서버는 서버 상태 기능이 비활성화되있네요..`)
        } else if (subcommand === "활성화") {
            if (data.guilds[guild.id].stats) {
                await interaction.reply(`이미 서버 상태 기능이 활성화되있습니다`);
                return;
            }
            const all_members = guild.members.cache.size;
            const user_members = guild.members.cache.filter(m => !m.user.bot).size;
            const bot_members = guild.members.cache.filter(m => m.user.bot).size;

            const category = await guild.channels.create("보고사항", { type: 'GUILD_CATEGORY', position: 1})
            data.guilds[guild.id]["stats"] = {
                category: category.id,
                all_channel: (await guild.channels.create(`린민전체-${all_members}`, { type: 'GUILD_TEXT', parent: category.id, position: 1})).id,
                user_channel: (await guild.channels.create(`동무-${user_members}`, { type: 'GUILD_TEXT', parent: category.id, position: 2})).id,
                bot_channel: (await guild.channels.create(`로보트-${bot_members}`, { type: 'GUILD_TEXT', parent: category.id, position: 3})).id
            };
            json_update(data);
            await interaction.reply("서버 상태 기능을 활성화 했습니다");
        } else if (subcommand === "비활성화") {
            if (!data.guilds[guild.id].stats) {
                await interaction.reply(`이미 서버 상태 기능이 비활성화되있습니다`);
                return;
            }
            await guild.channels.cache.get(data.guilds[guild.id].stats.category).delete();
            await guild.channels.cache.get(data.guilds[guild.id].stats.all_channel).delete();
            await guild.channels.cache.get(data.guilds[guild.id].stats.user_channel).delete();
            await guild.channels.cache.get(data.guilds[guild.id].stats.bot_channel).delete();
            delete data.guilds[guild.id].stats
            json_update(data);
            await interaction.reply("서버 상태 기능을 비활성화 했습니다");
        } else if (subcommand === "리셋") {
            if (!data.guilds[guild.id].stats) {
                await interaction.reply(`서버 상태 기능이 설정되있지않습니다.`);
            }
            const stats = data.guilds[guild.id].stats
            guild.channels.cache.get(stats.all_channel)
                .setName(`린민전체-${guild.members.cache.size}`);
            guild.channels.cache.get(stats.user_channel)
                .setName(`동무-${guild.members.cache.filter(m => !m.user.bot).size}`);
            guild.channels.cache.get(stats.bot_channel)
                .setName(`로보트-${guild.members.cache.filter(m => m.user.bot).size}`);
            await interaction.reply(`서버 상태 기능이 리셋되었습니다`);
        }
    }
}