const { CommandInteraction } = require('discord.js');
const { meal_embed } = require('../api/school/school');

module.exports = {
    name: "show",
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const data = require('../api/school/meal_data.json');
        await interaction.reply({ 
            embeds: [ meal_embed((interaction.options.getString("날") == "today") 
                ? data.today 
                : data.nextday) ]
            });
    }
}