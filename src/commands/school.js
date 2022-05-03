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
            const options = [
                { label: '서울특별시교육청', value: 'B10' },
                { label: '부산광역시교육청', value: 'C10' },
                { label: '대구광역시교육청', value: 'D10' },
                { label: '인천광역시교육청', value: 'E10' },
                { label: '광주광역시교육청', value: 'F10' },
                { label: '대전광역시교육청', value: 'G10' },
                { label: '울산광역시교육청', value: 'H10' },
                { label: '세종특별자치시교육청', value: 'I10' },
                { label: '경기도교육청', value: 'J10' },
                { label: '강원도교육청', value: 'K10' },
                { label: '충청북도교육청', value: 'M10' },
                { label: '충청남도교육청', value: 'N10' },
                { label: '전라북도교육청', value: 'P10' },
                { label: '전라남도교육청', value: 'Q10' },
                { label: '경상북도교육청', value: 'R10' },
                { label: '경상남도교육청', value: 'S10' },
                { label: '제주특별자치도교육청', value: 'T10' },
                { label: '재외한국학교교육청', value: 'V10' }
            ];
            const query = interaction.options.getString("학교");
            const select = new MessageActionRow({
                components: [
                    new MessageSelectMenu({
                        customId: "sido_select",
                        placeholder: "학교가 소속된 교육청을 선택해주세요",
                        options: options
                    })
                ]
            });
            const filter = (i) => { return i.user.id === interaction.user.id; };
            await interaction.reply({ components: [select] });
            interaction.channel.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 10000})
            .then(async _interaction => {
                const res = axios.get("https://open.neis.go.kr/hub/schoolInfo", {
                    params: {
                        KEY: "f0491ec9a1784e2cb92d2a4070f1392b",
                        Type: "json",
                        pIndex: 1,
                        pSize: 100,
                        ATPT_OFCDC_SC_CODE: _interaction.values[0],
                        SCHUL_NM: query
                    }
                });
                if (res.data.schoolInfo[0].head[1].RESULT.CODE != 'INFO-000') {
                    await interaction.editReply("나이스 API와 연동 중 오류가 발생하였습니다.");
                    return;
                }
                const schools = res.data.schoolInfo[1].row.map(school => (
                    { [school.SCHUL_NM]: school.SD_SCHUL_CODE }
                ));
                const _select = new MessageActionRow({
                    components: [
                        new MessageSelectMenu({
                            custom_id: "select_school",
                            placeholder: "추가할 학교를 선택하세요!",
                            options: res.data.schoolInfo[1].row.map(school => ({ 
                                label: school.SCHUL_NM, 
                                value: school.SCHUL_NM,
                            }))
                        }),
                        new MessageButton({
                            customId: "cancel",
                            label: "x",
                            style: 'DANGER'
                        })
                    ]
                })
                await interaction.editReply({ components: [_select] });
                interaction.channel.awaitMessageComponent({ filter, time: 10000})
                .then(async __interaction => {
                    if (__interaction.customId == "select_school") {
                        school_data[__interaction.values[0]] = {
                            code: schools[__interaction.values[0]],
                            sido: _interaction.values[0]
                        }
                        json_update(school_data, 1);
                        await interaction.editReply({
                            content: `${title}[${__interaction.values[0]}] 학교가 추가 되었습니다!`,
                            components: []
                        });
                    } else if (__interaction.customId == "cancel") {
                        await interaction.editReply({
                            content: "학교 추가가 취소되었습니다.",
                            components: []
                        })
                    }
                }).catch(async err => {
                    interaction.editReply({
                        content: "명령어가 만료 되었습니다.",
                        components: []
                    })
                })
            }).catch(async err => {
                await interaction.editReply({
                    content: "명령어가 만료 되었습니다.",
                    components: []
                });
            });    
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