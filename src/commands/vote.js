const { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

module.exports = {
    name: "vote",
    /**
     * @param { CommandInteraction } interaction
     */
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        let data = require("../data/data.json");
        if (subcommand == "생성") {
            const topic = interaction.options.getString("주제");

            if (!data.guilds[interaction.guild.id].votes)
                data.guilds[interaction.guild.id].votes = [];

            data.guilds[interaction.guild.id].push({ topic, author: interaction.user.id, voter: [] });

            const index = data.guilds[interaction.guild.id].votes.length;
            const btns = new MessageActionRow({
                components: [
                    new MessageButton({ customId: "yes", label: "찬성", style: 'SUCCESS' }),
                    new MessageButton({ customId: "no", label: "반대", style: 'DANGER' })
                ]
            });

            const create_embed = (data) => {
                const vote = data.guilds[interaction.guild.id].vote[index];
                const author = interaction.user;
                return new MessageEmbed({
                    author: { name: `${author.username}님의 투표 주제`, iconURL: author.displayAvatarURL() },
                    title: `**${vote.topic}**`,
                    fileds: [
                        { 
                            name: `**찬성 [${vote.voter.filter(i => i.answer == "o").length}명]**`, 
                            value: vote.voter.filter(i => i.answer == "o").map(id => (interaction.guild.members.cache.get(id).user.tag)).join("\n")
                        },
                        {
                            name: `**반대 [${vote.voter.filter(i => i.answer == "x").length}명]**`, 
                            value: vote.voter.filter(i => i.answer == "x").map(id => (interaction.guild.members.cache.get(id).user.tag)).join("\n")
                        }
                    ]
                });
            }
            await interaction.channel.send({ embeds: [create_embed()], components: [btns] });
            const collecter = interaction.channel.createMessageComponentCollector();
            collecter.on('collect', async i => {
                if (i.customId == "yes") {
                    i.deferUpdate();
                    let data = require("../data/data.json");
                    if (!data.guilds[i.guild.id].vote.voter.find(user => user.id == i.user.id && user.answer == "o")) {
                        data.guilds[i.guild.id].vote.voter
                    }
                } else if (i.customId == "no") {
                    i.deferUpdate();
                    let data = require("../data/data.json");
                }
            })

            /**
             * voter를 array가 아닌 dict 형식으로 변환하고 다시 코딩 요망,
             * 지금 개 피곤해서 이렇게 커밋 올리겠음
             * 학교의 내가 잘 해주도록!
             */
            
        } else if (subcommand == "마감") {
        }
    }
}