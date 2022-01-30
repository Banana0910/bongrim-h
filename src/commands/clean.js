module.exports = {
    name: "clean",
    async execute(interaction) {
        const count = interaction.options.getInteger("양");
        await interaction.channel.bulkDelete(count);
        await interaction.reply(`${count}만큼의 채팅을 삭제했음!`);
    }
}