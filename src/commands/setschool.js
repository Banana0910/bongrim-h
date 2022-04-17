const { CommandInteraction, MessageButton, MessageActionRow, MessageSelectMenu } = require("discord.js");
const { json_update } = require('../api/drive/drive');
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "setschool",
    /**
     * @param { CommandInteraction } interaction
     */
    async execute(interaction) {
        const school_data = require('../api/school/school_data.json');
        let student_data = require('../api/school/student_data.json');
        const filter = (i) => { return i.user.id === interaction.user.id; };
        const select = new MessageActionRow({
            components: [
                new MessageSelectMenu({
                    customId: "select_school",
                    placeholder: "자신의 학교를 선택하세요!",
                    options: Object.keys(school_data).map(sid => ({ label: school_data[sid], value: sid })),
                })
            ]
        })
        await interaction.reply({ components: [select] });
        interaction.channel.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 10000})
            .then(_interaction => {
                student_data[interaction.user.id] = _interaction.values[0];
                interaction.editReply({
                    content: `당신의 학교는 ${school_data[student_data[interaction.user.id]]}로 설정되었습니다!`,
                    components: []
                });
                json_update(student_data, 2);
            }).catch(err => { 
                interaction.editReply({
                    content: '명령어가 만료 되었습니다',
                    components: []
                }); 
            });
    }
}