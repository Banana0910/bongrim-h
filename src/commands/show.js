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
        const student_data = require(path.join(__dirname,"..","api","school","student_data.json"));
        const sid = student_data[interaction.user.id];
        if (!sid) {
            await interaction.reply(`setschool 명령어를 사용하여 학교를 등록해주세요!`);
            return;
        }
        let data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'api', 'school','meal_data.json')));
        const color = interaction.guild.me.displayHexColor
        const target = (interaction.options.getString("날") == "today") ? data[sid].today : data[sid].nextday
        await interaction.reply({ embeds: [ meal_embed(target, color, sid), timetable_embed(target, color, sid)] });
    }
}