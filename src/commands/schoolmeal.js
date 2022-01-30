const { getmeal, meal_embed } = require('../api/school/school')
const { MessageEmbed } = require('discord.js')

module.exports = {
    name: "schoolmeal",
    async execute(interaction) {
        const year = interaction.options.getInteger("연").toString();
        const month = interaction.options.getInteger("월").toString().padStart(2,'0');
        const day = interaction.options.getInteger("일").toString().padStart(2,'0');
        await interaction.reply({ embeds: [new MessageEmbed({
            title: `${year}년 ${month}월 ${day}일 급식`,
            description: "급식 가져오는 중..",
            color: '0x139BCC'
        })] });
        getmeal(year, month, day)
            .then(async (data) => { await interaction.editReply({ embeds: [meal_embed(data)]}) })
            .catch(async (err) => {
                await interaction.editReply({ 
                    content: (err == "no meal") 
                        ? `${year}년 ${month}월 ${day}일 에는 급식이 없습니다..` 
                        : `오류가 발생하여 급식을 가져오지 못하였습니다.`,
                    embeds: []
                })
            });
    }
}