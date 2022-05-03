const { CommandInteraction, MessageActionRow, MessageButton, MessageSelectMenu, Message } = require("discord.js");
const { json_update } = require('../api/drive/drive');
const axios = require("axios");

module.exports = {
    name: "school",
    /**
     * @param { CommandInteraction } interaction
     */
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        let student_data = require('../api/school/student_data.json');
        let school_data = require('../api/school/school_data.json');
        if (subcommand === "추가") {
            const query = interaction.options.getString("학교");
            const res = await axios.get("https://open.neis.go.kr/hub/schoolInfo", {
                params: {
                    KEY: "f0491ec9a1784e2cb92d2a4070f1392b",
                    Type: "json",
                    pIndex: 1,
                    pSize: 100,
                    SCHUL_NM: query
                }
            });
            if (res.data.schoolInfo[0].head[1].RESULT.CODE != 'INFO-000') {
                await interaction.editReply("나이스 API와 연동 중 오류가 발생하였습니다.");
                return;
            }
            const select = new MessageActionRow({
                components: [
                    new MessageSelectMenu({
                        custom_id: "select_school",
                        placeholder: "추가할 학교를 선택하세요",
                        options: res.data.schoolInfo[1].row.map(school => ({ 
                            label: school.SCHUL_NM, 
                            description: school.ATPT_OFCDC_SC_NM,
                            value: school.SD_SCHUL_CODE,
                        }))
                    }),
                ]
            })
            const cancel_btn = new MessageActionRow({
                components: [
                    new MessageButton({
                        customId: "cancel",
                        label: "취소",
                        style: 'DANGER'
                    })
                ]
            })
            let schools = {};
            res.data.schoolInfo[1].row.map(school => {
                schools[school.SD_SCHUL_CODE] = { name: school.SCHUL_NM, sido: school.ATPT_OFCDC_SC_CODE };
            })
            console.log(schools);
            await interaction.reply({ components: [select, cancel_btn] });
            const filter = (i) => { return i.user.id === interaction.user.id; };
            interaction.channel.awaitMessageComponent({ filter, time: 10000})
            .then(async _interaction => {
                if (_interaction.customId == "select_school") {
                    school_data[schools[_interaction.values[0]].name] = {
                        code: _interaction.values[0],
                        sido: schools[_interaction.values[0]].sido
                    }
                    json_update(school_data, 1);
                    await interaction.editReply({
                        content: `**${schools[_interaction.values[0]].name}**가 추가 되었습니다!`,
                        components: []
                    });
                } else if (_interaction.customId == "cancel") {
                    await interaction.editReply({
                        content: "학교 추가가 취소되었습니다.",
                        components: []
                    })
                }
            }).catch(async err => {
                console.log(err);
                interaction.editReply({
                    content: "명령어가 만료 되었습니다.",
                    components: []
                })
            })
        } else if (subcommand == "설정") {
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
}