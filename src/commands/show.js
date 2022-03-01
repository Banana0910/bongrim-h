const { CommandInteraction } = require('discord.js');
const { meal_embed, timetable_embed } = require('../api/school/school');

module.exports = {
    name: "show",
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const data = require('../api/school/meal_data.json');
        const target = (interaction.options.getString("날") == "today") ? data.today : data.nextday
        await interaction.reply({ embeds: [ meal_embed(target), timetable_embed(target)] });
    }
}