const { meal_embed } = require('../api/school/school');

module.exports = {
    name: "show",
    async execute(interaction) {
        const today = require('../api/school/meal_data.json');
        await interaction.reply({ embeds: [meal_embed(today)]});
    }
}