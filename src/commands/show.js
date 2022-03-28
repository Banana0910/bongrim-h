const { CommandInteraction } = require('discord.js');
const { meal_embed, timetable_embed } = require('../api/school/school');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: "show",
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        let data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'api', 'school','meal_data.json')));
        const color = interaction.guild.me.displayHexColor
        const target = (interaction.options.getString("날") == "today") ? data.today : data.nextday
        await interaction.reply({ embeds: [ meal_embed(target, color), timetable_embed(target, color)] });
    }
}