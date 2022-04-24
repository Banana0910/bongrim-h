const { getmeal, meal_embed } = require('../api/school/school');
const { MessageEmbed } = require('discord.js');
const { send_log } = require('../index');
const path = require("path");

module.exports = {
    name: "schoolmeal",
    /** 
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const student_data = require(path.join(__dirname,"..","api","school","student_data.json"));
        if (!student_data[interaction.user.id]) {
            await interaction.reply(`setschool 명령어를 사용하여 학교를 등록해주세요!`);
            return;
        }
        const days = [null , "월", "화", "수", "목", "금", null];
        const year = interaction.options.getInteger("연").toString();
        const month = interaction.options.getInteger("월").toString().padStart(2,'0');
        const day = interaction.options.getInteger("일").toString().padStart(2,'0');
        const dayofweek = days[(new Date(
            interaction.options.getInteger("연"), 
            interaction.options.getInteger("월"), 
            interaction.options.getInteger("일")
        )).getDay()];
        await interaction.reply({ embeds: [new MessageEmbed({
            title: `${year}년 ${month}월 ${day}일 ${dayofweek}요일 급식`,
            description: "급식 가져오는 중..",
            color: interaction.guild.me.displayHexColor
        })] });
        getmeal(year, month, day, student_data[interaction.user.id])
            .then(async (data) => { await interaction.editReply({ embeds: [meal_embed(data, interaction.guild.me.displayHexColor, student_data[interaction.user.id])]}) })
            .catch(async (err) => {
                if (err == "no meal") {
                    await interaction.editReply({ content: `${year}년 ${month}월 ${day}일 ${dayofweek}요일에는 급식이 없습니다..`, embeds: [] });
                    send_log(`[schoolmeal 중 오류 발생] 급식이 없음`);
                } else {
                    await interaction.editReply({ content: `오류가 발생하여 급식을 가져오지 못하였습니다.`, embeds: [] });
                    send_log(`[schoolmeal 중 오류 발생] ${err}`);
                }
            });
    }
}