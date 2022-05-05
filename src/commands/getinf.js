const { gettoday } = require('../api/school/school');
const { CommandInteraction } = require('discord.js');
const { send_log } = require("../index");

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
                if (err != "over nextday") {
                    await interaction.editReply("급식을 가져오는 중 오류가 발생하여 실패했습니다..");
                    send_log(`[getinf 중 오류 발생] ${err}`);
                }
            });
    }
}