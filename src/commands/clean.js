const { CommandInteraction } = require("discord.js");

module.exports = {
    name: "clean",
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const count = interaction.options.getInteger("양");
        await interaction.channel.bulkDelete(count);
        await interaction.reply({ content: `${count}개의 채팅을 삭제했습니다!`, ephemeral: true });
    }
}