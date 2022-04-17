const { get_timetable } = require("../api/school/school");
const { CommandInteraction } = require('discord.js');
const path = require("path");

module.exports = {
    name: "timetable",
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const student_data = require(path.join(__dirname,"..","api","school","student_data.json"));
        if (!student_data[interaction.user.id]) {
            await interaction.reply(`setschool 명령어를 사용하여 학교를 등록해주세요!`);
            return;
        }
        const dayofweek = interaction.options.getInteger("요일");
        await interaction.reply({ embeds: [get_timetable(dayofweek, interaction.guild.me.displayHexColor, student_data[interaction.user.id])] });
    }
}