const { gettoday } = require('../api/school/school')
const { CommandInteraction } = require('discord.js')

module.exports = {
    name: "getinf",
    /**
     * @param {CommandInteraction} interaction
    */
    async execute(interaction) {
        await interaction.reply("오늘과 다음날 급식 가져오는 중..")
        gettoday()
            .then(async () => { await interaction.editReply("급식 정보가 서버에 저장되었습니다!") })
            .catch(async (err) => { 
                await interaction.editReply((err == "over nextday") 
                ? "2주 동안 급식이 없는것 같으니, 아마도 방학이거나 오류이지 않을까 싶습니다.."
                : "급식을 가져오는 중 오류가 발생하여 실패했습니다..");
            });
    }
}