const { CommandInteraction, MessageEmbed, Message } = require("discord.js");
const { json_update } = require("../api/drive/drive");

module.exports = {
    name: "level",
    /** 
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        let data = require('../data/data.json');
        const subcommand = interaction.options.getSubcommand();
        const guild = interaction.guild;
        if (subcommand == "활성화") {
            if (data.guilds[guild.id].levels) {
                await interaction.reply("이미 유저 레벨 기능이 활성화 되있습니다");
                return;
            }
            data.guilds[guild.id].levels = {};
            guild.members.cache.map((member) => {
                if (!member.user.bot) {
                    data.guilds[guild.id].levels[member.id] = { 
                        level: 0, 
                        msg: 0, 
                        exp: 0, 
                        cool: new Date().getTime()-60000 
                    }
                }
            });
            json_update(data);
            await interaction.reply("유저 레벨 기능이 활성화 되었습니다");
        } else if (subcommand == "비활성화") {
            if (!data.guilds[guild.id].levels) {
                await interaction.reply("이미 유저 레벨 기능이 비활성화 되있습니다");
                return;
            }
            delete data.guilds[guild.id].levels;
            json_update(data);
            await interaction.reply("유저 레벨 기능이 비활성화 되었습니다")
        } else if (subcommand == "조회") {
            const user = interaction.guild.members.cache.get((interaction.options.getUser("유저") || interaction.user).id)
            const user_level = data.guilds[interaction.guild.id].levels[user.id];
            const rank = Object.keys(data.guilds[interaction.guild.id].levels).map(u => ([u, data.guilds[interaction.guild.id].levels[u].msg]));
            rank.sort((a,b) => (b[1] - a[1]));
            const embed = new MessageEmbed({
                author: { name: interaction.guild.name, icon_url: interaction.guild.iconURL() },
                title: `${user.displayName} [#${rank.findIndex(f => f[0] == user.id)+1} / ${rank.length}]`,
                thumbnail: { url: user.displayAvatarURL() },
                fields: [
                    { name: "레벨", value: `${user_level.level}Lvl`, inline: true  },
                    { name: "메시지", value: `${user_level.msg}xp`, inline: true },
                    { name: "경험치", value: `${user_level.exp}xp`, inline: true }
                ],
                color: user.displayHexColor,
            });
            await interaction.reply({ embeds: [embed] });
        }
    }
}