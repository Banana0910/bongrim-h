const { get_timetable } = require("../api/school/school");
const { CommandInteraction } = require('discord.js');

module.exports = {
    name: "timetable",
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const dayofweek = interaction.options.getInteger("요일");
        await interaction.reply({ embeds: [get_timetable(dayofweek)] });
    }
}