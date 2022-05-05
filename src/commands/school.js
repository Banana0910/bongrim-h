const { CommandInteraction, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
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
            if (res.data.RESULT) {
                if (res.data.RESULT.CODE == 'INFO-200') {
                    await interaction.reply(`**[${query}]**라는 이름을 가진 학교는 대한민국에 없는 듯합니다..`);
                } else {
                    await interaction.reply(`나이스와 통신 중 [${res.data.RESULT.MESSAGE}]라는 오류가 발생하였습니다.`);
                }
                return;
            }

            if (res.data.schoolInfo[1].row.length > 25) {
                await interaction.reply(`**[${query}]**이(가) 포함된 학교가 너무 많음.. 구체적인 이름을 작성해주세요.`);
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
            });
            let schools = {};
            res.data.schoolInfo[1].row.map(school => {
                schools[school.SD_SCHUL_CODE] = { name: school.SCHUL_NM, sido: school.ATPT_OFCDC_SC_CODE };
            })
            await interaction.reply({ components: [select, cancel_btn], ephemeral: true });
            const filter = (i) => { return i.user.id === interaction.user.id; };
            interaction.channel.awaitMessageComponent({ filter, time: 10000})
                .then(async _interaction => {
                    if (_interaction.customId == "select_school") {
                        if (school_data[schools[_interaction.values[0]].name]) {
                            await interaction.editReply({
                                content: `이미 **[${schools[_interaction.values[0]].name}]**은(는) 추가 되어있습니다`,
                                components: []
                            });
                            return;
                        }
                        school_data[schools[_interaction.values[0]].name] = {
                            code: _interaction.values[0],
                            sido: schools[_interaction.values[0]].sido
                        }
                        json_update(school_data, 1);
                        await interaction.editReply({
                            content: `**[${schools[_interaction.values[0]].name}]**가 추가 되었습니다!`,
                            components: []
                        });
                    } else if (_interaction.customId == "cancel") {
                        await interaction.editReply({
                            content: "학교 추가가 취소되었습니다.",
                            components: []
                        })
                    }
                }).catch(async () => {
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
                        options: Object.keys(school_data).map(sname => ({ label: sname, value: sname })),
                    })
                ]
            });
            const cancel_btn = new MessageActionRow({
                components: [
                    new MessageButton({
                        customId: "cancel",
                        label: "취소",
                        style: 'DANGER'
                    })
                ]
            });
            await interaction.reply({ components: [select, cancel_btn], ephemeral: true });
            interaction.channel.awaitMessageComponent({ filter, time: 10000})
                .then(async _interaction => {
                    if (_interaction.customId == 'select_school') {
                        student_data[interaction.user.id] = _interaction.values[0];
                        json_update(student_data, 2);
                        await interaction.editReply({
                            content: `당신의 학교는 ${student_data[interaction.user.id]}로 설정되었습니다!`,
                            components: []
                        });
                    } else if (_interaction.customId == 'cancel') {
                        await interaction.editReply({
                            content: "학교 설정이 취소되었습니다.",
                            components: []
                        });
                    }
                }).catch(async () => { 
                    await interaction.editReply({
                        content: '명령어가 만료 되었습니다',
                        components: []
                    }); 
                });
        } else if (subcommand == "제거") {
            const select = new MessageActionRow({
                components: [
                    new MessageSelectMenu({
                        custom_id: "select_school",
                        placeholder: "제거할 학교를 선택하세요!",
                        options: Object.keys(school_data).map(sname => ({ label: sname, value: sname })),
                    })
                ]
            });
            const cancel_btn = new MessageActionRow({
                components: [
                    new MessageButton({
                        customId: "cancel",
                        label: "취소",
                        style: 'DANGER'
                    })
                ]
            });
            await interaction.reply({ components: [select, cancel_btn], ephemeral: true });
            const filter = (i) => { return i.user.id === interaction.user.id; }
            interaction.channel.awaitMessageComponent({ filter, time: 10000})
                .then(async _interaciton => {
                    if (_interaciton.customId == "select_school") {
                        await _interaciton.deferUpdate();
                        const btns = new MessageActionRow({
                            components: [
                                new MessageButton({ customId: "yes", label: "ㅇㅇ", style: 'PRIMARY' }),
                                new MessageButton({ customId: "no", label: "ㄴㄴ", style: 'DANGER' })
                            ]
                        });
                        await interaction.editReply({
                            content: `정말로 **[${_interaciton.values[0]}]**을(를) 삭제할꺼??`,
                            components: [btns]
                        });
                        interaction.channel.awaitMessageComponent({ filter, time: 10000})
                            .then(async __interaction => {
                                if (__interaction.customId == "yes") {
                                    delete school_data[_interaciton.values[0]];
                                    Object.keys(student_data).map(user => {
                                        if (student_data[user] == _interaciton.values[0]) {
                                            delete student_data[user];
                                        }
                                    });
                                    json_update(school_data, 1);
                                    await interaction.editReply({
                                        content: `정상적으로 이 봇이 **[${_interaciton.values[0]}]**을(를) 잊게되었습니다`,
                                        components: []
                                    });
                                } else if(__interaction.customId == "no") {
                                    await interaction.editReply({
                                        content: `음.. 그럼 **[${_interaciton.values[0]}]**은(는) 남겨두도록 하죠`,
                                        components: []
                                    });
                                }
                            }).catch(async () => {
                                await interaction.editReply({
                                    content: '명령어가 만료 되었습니다',
                                    components: []
                                }); 
                            })
                    } else if (_interaciton.customId == "cancel") {
                        await interaction.editReply({
                            content: "학교 제거가 취소되었습니다.",
                            components: []
                        });
                    }
                }).catch(async () => {
                    await interaction.editReply({
                        content: '명령어가 만료 되었습니다',
                        components: []
                    }); 
                })
        }
    }
}