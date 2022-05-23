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
                                name: `**찬성 [${Object.values(vote.voter).filter(a => a == "o").length}명]**`, 
                                value: get_list("o"),
                                inline: true
                            },
                            {
                                name: `**반대 [${Object.values(vote.voter).filter(a => a == "x").length}명]**`, 
                                value: get_list("x"),
                                inline: true
                            }
                        ],
                        color: author.displayHexColor,
                        footer: { text: interaction.guild.name, iconURL: interaction.guild.iconURL() }
                    })
                ],
                components: [
                    new MessageActionRow({
                        components: [
                            new MessageButton({ customId: `yes${index}`, label: "찬성", style: 'SUCCESS' }),
                            new MessageButton({ customId: `no${index}`, label: "반대", style: 'DANGER' })
                        ]
                    })
                ]
            }
        }
        let data = require("../data/data.json");
        if (subcommand == "생성") {
            const topic = interaction.options.getString("주제");

            if (!data.guilds[interaction.guild.id].votes)
                data.guilds[interaction.guild.id].votes = [];

            data.guilds[interaction.guild.id].votes.push({ topic, author: interaction.user.id, voter: {} });
            json_update(data, 0);

            const index = data.guilds[interaction.guild.id].votes.length-1;

            const msg = await interaction.channel.send(create_vote(interaction, index, data));
            const collecter = interaction.channel.createMessageComponentCollector();
            collecter.on('collect', async i => {
                if (i.customId == `yes${index}`) {
                    i.deferUpdate();
                    let data = require("../data/data.json");
                    data.guilds[interaction.guild.id].votes[index].voter[i.user.id] = "o";
                    await msg.edit(create_vote(interaction, index, data));
                    json_update(data, 0);
                } else if (i.customId == `no${index}`) {
                    i.deferUpdate();
                    let data = require("../data/data.json");
                    data.guilds[interaction.guild.id].votes[index].voter[i.user.id] = "x";
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
                    description: `찬성 : ${Object.values(vote.voter).filter(a => a == "o").length}명 반대 : ${Object.values(vote.voter).filter(a => a == "x").length}명`,
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
                    interaction.deleteReply();
                    const index = Number(_interaction.values[0]);
                    const msg = await interaction.channel.send(create_vote(interaction, index, data));
                    const collecter = interaction.channel.createMessageComponentCollector();
                    collecter.on('collect', async i => {
                        if (i.customId == `yes${index}`) {
                            i.deferUpdate();
                            let data = require("../data/data.json");
                            data.guilds[interaction.guild.id].votes[index].voter[i.user.id] = "o";
                            await msg.edit(create_vote(interaction, index, data));
                            json_update(data, 0);
                        } else if (i.customId == `no${index}`) {
                            i.deferUpdate();
                            let data = require("../data/data.json");
                            data.guilds[interaction.guild.id].votes[index].voter[i.user.id] = "x";
                            await msg.edit(create_vote(interaction, index, data));
                            json_update(data, 0);
                        }
                    });
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
                    description: `찬성 : ${Object.values(vote.voter).filter(a => a == "o").length}명 반대 : ${Object.values(vote.voter).filter(a => a == "x").length}명`,
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
                            data.guilds[interaction.guild.id].votes[index].voter[i.user.id] = "o";
                            await msg.edit(create_vote(interaction, index, data));
                            json_update(data, 0);
                        } else if (i.customId == `no${index}`) {
                            i.deferUpdate();
                            let data = require("../data/data.json");
                            data.guilds[interaction.guild.id].votes[index].voter[i.user.id] = "x";
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