const { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require("discord.js");
const { json_update } = require("../api/drive/drive");

module.exports = {
    name: "vote",
    /**
     * @param { CommandInteraction } interaction
     */
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const create_vote = (interaction, index, data) => {
            const vote = data.guilds[interaction.guild.id].votes[index];
            const author = interaction.member;

            const yes_length = Object.values(vote.voter).filter(a => a == 0).length;
            const no_length = Object.values(vote.voter).filter(a => a == 1).length;
            const all_length = Object.values(vote.voter).length;

            const yes_bar = Math.round((yes_length + no_length == 0) ? 5 : yes_length * 10 / all_length);
            const no_bar = Math.round((yes_length + no_length == 0) ? 5 : no_length * 10 / all_length);

            const get_list = (condition) => {
                const output = Object.keys(vote.voter).filter(k => vote.voter[k] == condition)
                    .map(id => (interaction.guild.members.cache.get(id).user.tag)).join('\n')
                return (output != "") ? output : "없음";
            }
            return { 
                embeds: [
                    new MessageEmbed({
                        author: { name: `${author.user.username}님의 투표 주제`, iconURL: author.displayAvatarURL() },
                        title: `**${vote.topic}**`,
                        fields: [
                            { 
                                name: `**찬성 [${yes_length}명]**`, 
                                value: (vote.secret == 1) ? get_list(0) : "⠀",
                                inline: true
                            },
                            {
                                name: `**반대 [${no_length}명]**`, 
                                value: (vote.secret == 1) ? get_list(1) : "⠀",
                                inline: true
                            }
                        ],
                        description: `■ = 찬성 | □ = 반대 | ${(vote.secret == 1) ? "공개투표" : "비밀투표"}\n`
                            + `${(yes_length + no_length == 0) ? 50 : Math.round(yes_length / all_length * 100)}%⠀`
                            + `${'■'.repeat(yes_bar)}${'□'.repeat(no_bar)}`
                            + `⠀${(yes_length + no_length == 0) ? 50 : Math.round(no_length / all_length * 100)}%`,
                        color: author.displayHexColor,
                        footer: { text: interaction.guild.name, iconURL: interaction.guild.iconURL() }
                    })
                ],
                components: [
                    new MessageActionRow({
                        components: [
                            new MessageButton({ customId: `yes${index}`, label: "찬성", style: 'SUCCESS' }),
                            new MessageButton({ customId: `no${index}`, label: "반대", style: 'DANGER' }),
                            new MessageButton({ customId: `giveup${index}`, label: "기권", style: 'PRIMARY'})
                        ]
                    })
                ]
            }
        }
        let data = require("../data/data.json");
        if (subcommand == "생성") {
            const topic = interaction.options.getString("주제");
            const secret = interaction.options.getInteger("비밀투표") || 1;

            if (!data.guilds[interaction.guild.id].votes)
                data.guilds[interaction.guild.id].votes = [];

            data.guilds[interaction.guild.id].votes.push({ topic, author: interaction.user.id, secret, voter: {} });
            json_update(data, 0);

            await interaction.deferReply();
            await interaction.deleteReply();
            const index = data.guilds[interaction.guild.id].votes.length-1;
            const msg = await interaction.channel.send(create_vote(interaction, index, data));
            const collecter = interaction.channel.createMessageComponentCollector();
            collecter.on('collect', async i => {
                if (i.customId == `yes${index}`) {
                    i.deferUpdate();
                    let data = require("../data/data.json");
                    if (data.guilds[interaction.guild.id].votes) {
                        if (!data.guilds[interaction.guild.id].votes[index]) 
                            await msg.delete();
                    } else { await msg.delete(); }
                    data.guilds[interaction.guild.id].votes[index].voter[i.user.id] = 0;
                    await msg.edit(create_vote(interaction, index, data));
                    json_update(data, 0);
                } else if (i.customId == `no${index}`) {
                    i.deferUpdate();
                    let data = require("../data/data.json");
                    if (data.guilds[interaction.guild.id].votes) {
                        if (!data.guilds[interaction.guild.id].votes[index]) 
                            await msg.delete();
                    } else { await msg.delete(); }
                    data.guilds[interaction.guild.id].votes[index].voter[i.user.id] = 1;
                    await msg.edit(create_vote(interaction, index, data));
                    json_update(data, 0);
                } else if (i.customId == `giveup${index}`) {
                    i.deferUpdate();
                    let data = require("../data/data.json");
                    if (data.guilds[interaction.guild.id].votes) {
                        if (!data.guilds[interaction.guild.id].votes[index]) 
                            await msg.delete();
                    } else { await msg.delete(); }
                    delete data.guilds[interaction.guild.id].votes[index].voter[i.user.id];
                    await msg.edit(create_vote(interaction, index, data));
                    json_update(data, 0);
                }
            });
        } else if (subcommand == "마감") {
            if (!data.guilds[interaction.guild.id].votes) {
                await interaction.reply("이 서버에는 진행 중인 투표가 없습니다");
                return;
            }

            let options = [];
            for (let i = 0; i < data.guilds[interaction.guild.id].votes.length; i++) {
                const vote = data.guilds[interaction.guild.id].votes[i];
                options[i] = {
                    label: vote.topic,
                    description: `개최자 : ${interaction.guild.members.cache.get(vote.author).user.tag} | 
                        찬성 : ${Object.values(vote.voter).filter(a => a == 0).length}명 | 
                        반대 : ${Object.values(vote.voter).filter(a => a == 1).length}명`,
                    value: i.toString()
                }
            }
            const select = new MessageActionRow({
                components: [
                    new MessageSelectMenu({
                        custom_id: "close_vote",
                        placeholder: "마감할 투표를 선택해주세요!",
                        options: options
                    }),
                ]
            });

            await interaction.reply({ components: [select]});
            const filter = (i) => { return i.user.id === interaction.user.id; };
            interaction.channel.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 20000})
                .then(async _interaction => {
                    const index = Number(_interaction.values[0]);
                    if (_interaction.user.id != data.guilds[interaction.guild.id].votes[index].author ||
                        !_interaction.member.permissions.has("ADMINISTRATOR")) {
                        await interaction.editReply({ content: "오직 개최자거나 관리자만이 투표를 마감할 수 있습니다", components: [] });
                        return;
                    }
                    const vote = data.guilds[interaction.guild.id].votes[index];

                    const yes_length = Object.values(vote.voter).filter(a => a == 0).length;
                    const no_length = Object.values(vote.voter).filter(a => a == 1).length;
                    const all_length = Object.values(vote.voter).length;

                    const yes_bar = Math.round((yes_length + no_length == 0) ? 5 : yes_length * 10 / all_length);
                    const no_bar = Math.round((yes_length + no_length == 0) ? 5 : no_length * 10 / all_length);

                    const get_list = (condition, bold) => {
                        const output = Object.keys(vote.voter).filter(k => vote.voter[k] == condition)
                            .map(id => ((bold) ? `**${interaction.guild.members.cache.get(id).user.tag}**` : interaction.guild.members.cache.get(id).user.tag))
                            .join('\n')
                        return (output != "") ? output : "없음";
                    }
                    const embed = new MessageEmbed({
                        title: `${vote.topic}의 결과\n${(yes_length >= no_length) ? ((yes_length == no_length) ? "비겼습니다!" 
                            : `${yes_length - no_length}표차로 찬성 승리!`) 
                            : `${no_length - yes_length}표차로 반대 승리!`}`,
                        author: { name: `${_interaction.user.username}님의 투표 결과`, iconURL: _interaction.user.displayAvatarURL() },
                        fields: [
                            { 
                                name: `**찬성 [${Object.values(vote.voter).filter(a => a == 0).length}명]**`, 
                                value: (vote.secret == 1) ? get_list(0, (yes_length > no_length) ? true : false) : "⠀",
                                inline: true
                            },
                            {
                                name: `**반대 [${Object.values(vote.voter).filter(a => a == 1).length}명]**`, 
                                value: (vote.secret == 1) ? get_list(1, (no_length > yes_length) ? true : false) : "⠀",
                                inline: true
                            }
                        ],
                        description: `■ = 찬성 | □ = 반대 | ${(vote.secret == 1) ? "공개투표" : "비밀투표"}\n`
                            + `${(yes_length + no_length == 0) ? 50 : Math.round(yes_length / all_length * 100)}%⠀`
                            + `${'■'.repeat(yes_bar)}${'□'.repeat(no_bar)}`
                            + `⠀${(yes_length + no_length == 0) ? 50 : Math.round(no_length / all_length * 100)}%`,
                        color: _interaction.member.displayHexColor,
                        footer: { text: _interaction.guild.name, iconURL: _interaction.guild.iconURL() }
                    })
                    await interaction.editReply({ embeds: [embed], components: [] });
                    if (data.guilds[interaction.guild.id].votes.length-1 == 0) {
                        delete data.guilds[interaction.guild.id].votes;
                    } else {
                        data.guilds[interaction.guild.id].votes.splice(index, 1);
                    }
                    json_update(data, 0);
                }).catch(async () => {
                    await interaction.editReply({ content: "명령어가 만료되었습니다", components: []})
                })
        } else if (subcommand == "불러오기") {
            if (!data.guilds[interaction.guild.id].votes) {
                await interaction.reply("이 서버에는 진행 중인 투표가 없습니다");
                return;
            }

            let options = [];
            for (let i = 0; i < data.guilds[interaction.guild.id].votes.length; i++) {
                const vote = data.guilds[interaction.guild.id].votes[i];
                options[i] = {
                    label: vote.topic,
                    description: `개최자 : ${interaction.guild.members.cache.get(vote.author).user.tag} | 
                        찬성 : ${Object.values(vote.voter).filter(a => a == 0).length}명 | 
                        반대 : ${Object.values(vote.voter).filter(a => a == 1).length}명`,
                    value: i.toString()
                }
            }
            const select = new MessageActionRow({
                components: [
                    new MessageSelectMenu({
                        custom_id: "load_vote",
                        placeholder: "불러올 투표를 선택해주세요!",
                        options: options
                    }),
                ]
            });
            await interaction.reply({ components: [select]});
            const filter = (i) => { return i.user.id === interaction.user.id; };
            interaction.channel.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 20000})
                .then(async _interaction => {
                    interaction.deleteReply();
                    const index = Number(_interaction.values[0]);
                    const msg = await interaction.channel.send(create_vote(interaction, index, data));
                    const collecter = interaction.channel.createMessageComponentCollector();
                    collecter.on('collect', async i => {
                        if (i.customId == `yes${index}`) {
                            i.deferUpdate();
                            let data = require("../data/data.json");
                            if (data.guilds[interaction.guild.id].votes) {
                                if (!data.guilds[interaction.guild.id].votes[index]) 
                                    await msg.delete();
                            } else { await msg.delete(); }
                            data.guilds[interaction.guild.id].votes[index].voter[i.user.id] = 0;
                            await msg.edit(create_vote(interaction, index, data));
                            json_update(data, 0);
                        } else if (i.customId == `no${index}`) {
                            i.deferUpdate();
                            let data = require("../data/data.json");
                            if (data.guilds[interaction.guild.id].votes) {
                                if (!data.guilds[interaction.guild.id].votes[index]) 
                                    await msg.delete();
                            } else { await msg.delete(); }
                            data.guilds[interaction.guild.id].votes[index].voter[i.user.id] = 1;
                            await msg.edit(create_vote(interaction, index, data));
                            json_update(data, 0);
                        } else if (i.customId == `giveup${index}`) {
                            i.deferUpdate();
                            let data = require("../data/data.json");
                            if (data.guilds[interaction.guild.id].votes) {
                                if (!data.guilds[interaction.guild.id].votes[index]) 
                                    await msg.delete();
                            } else { await msg.delete(); }
                            delete data.guilds[interaction.guild.id].votes[index].voter[i.user.id];
                            await msg.edit(create_vote(interaction, index, data));
                            json_update(data, 0);
                        }
                    });
                }).catch(async () => {
                    await interaction.editReply({ content: "명령어가 만료되었습니다", components: []})
                })
        }
    }
}