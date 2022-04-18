const { CommandInteraction, MessageActionRow, MessageButton } = require("discord.js");
const axios = require("axios");
const che = require("cheerio");

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
            const sid = interaction.options.getString("학교");
            if (student_data[sid]) {
                await interaction.reply(`${student_data[sid]}는 이미 추가되어있습니다`);
                return;
            }
            await interaction.deferReply();
            const html = await axios.get(site_url(sid));
            if (html.status != 200) {
                await interaction.editReply(`${sid}라는 ID를 가진 창원시내 학교는 없는듯 합니다.`);
                return;
            }
            const $ = che.load(html.data);
            const title = $('title').text();
            const btns = new MessageActionRow({
                components: [ 
                    new MessageButton({ customId: "yes", label: "네", style: 'SUCCESS' }),
                    new MessageButton({ customId: "no", label: "아니오", style: 'DANGER' })
                ]
            });
            await interaction.editReply({
                content: `학교 이름이 ${title}이(가) 맞나요?`,
                components: [ btns ]
            });
            const filter = (i) => { return i.user.id === interaction.user.id; };
            interaction.channel.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 20000 })
                .then(async _interaction => {
                    if (_interaction.customId == "yes") {
                        school_data[sid] = title;
                        json_update(school_data, 1);
                        await interaction.editReply({
                            content: `${title}[${sid}] 학교가 추가 되었습니다!`,
                            components: []
                        });
                    } else {
                        await interaction.editReply({
                            content: "학교 추가가 취소 되었습니다",
                            components: []
                        });
                    }
                }).catch(async err => {
                    await interaction.editReply({
                        content: "명령어가 만료 되었습니다",
                        components: []
                    });
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