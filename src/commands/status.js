const { CommandInteraction } = require("discord.js");

module.exports = {
    name: "status",
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const guild = interaction.guild;
        const category = await guild.channels.create("보고사항", { type: 'GUILD_CATEGORY', position: 1});

        const all_members = guild.memberCount;
        const user_members = guild.members.cache.filter(m => !m.user.bot).size;
        const bot_members = all_members - user_members;
        await guild.channels.create(`린민들-${all_members}`, { type: 'GUILD_TEXT', parent: category.id, position: 1});
        await guild.channels.create(`동무들-${user_members}`, { type: 'GUILD_TEXT', parent: category.id, position: 2});
        await guild.channels.create(`로보트-${bot_members}`, { type: 'GUILD_TEXT', parent: category.id, position: 3});
        await interaction.reply("만들었음!");
    }
}