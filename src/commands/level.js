const { CommandInteraction, MessageEmbed, Message, GuildScheduledEvent } = require("discord.js");
const { json_update } = require("../api/drive/drive");

module.exports = {
    name: "level",
    /** 
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.reply("현재 레벨 기능이 점검 중 입니다..");
        // let data = require('../data/data.json');
        // const subcommand = interaction.options.getSubcommand();
        // const guild = interaction.guild;
        // if (subcommand == "활성화") {
        //     guild.members.cache.map((member) => {
        //         if (!member.user.bot) {
        //             data.guilds[guild.id].levels[member.id].tag = member.user.tag
        //         }
        //     });
        //     json_update(data);
        //     await interaction.reply("success");
        //     // if (data.guilds[guild.id].levels) {
        //     //     await interaction.reply("이미 유저 레벨 기능이 활성화 되있습니다");
        //     //     return;
        //     // }
        //     // data.guilds[guild.id].levels = {};
        //     // guild.members.cache.map((member) => {
        //     //     if (!member.user.bot) {
        //     //         data.guilds[guild.id].levels[member.id] = { 
        //     //             level: 0, 
        //     //             msg: 0, 
        //     //             exp: 0, 
        //     //             cool: new Date().getTime()-60000 
        //     //         }
        //     //     }
        //     // });
        //     // json_update(data);
        //     // await interaction.reply("유저 레벨 기능이 활성화 되었습니다");
        // } else if (subcommand == "비활성화") {
        //     if (!data.guilds[guild.id].levels) {
        //         await interaction.reply("이미 유저 레벨 기능이 비활성화 되있습니다");
        //         return;
        //     }
        //     delete data.guilds[guild.id].levels;
        //     json_update(data);
        //     await interaction.reply("유저 레벨 기능이 비활성화 되었습니다")
        // } else if (subcommand == "조회") {
        //     const user = guild.members.cache.get((interaction.options.getUser("유저") || interaction.user).id);
        //     if (user.user.bot) {
        //         await interaction.reply("봇은 조회가 안됩니다..");
        //         return;
        //     }
        //     const user_level = data.guilds[guild.id].levels[user.id];
        //     const rank = Object.keys(data.guilds[guild.id].levels).map(u => ([u, data.guilds[guild.id].levels[u].msg]));
        //     rank.sort((a,b) => (b[1] - a[1]));

        //     const now_xp = ((user_level.level-1)*(10*(user_level.level-2))/2)+100
        //     const next_xp = (user_level.level*(10*(user_level.level-1))/2)+100 // 등차수열의 합 공식 적용

        //     console.log(`now_xp[${user_level.level}][${user.displayName}] : ${now_xp}`);
        //     console.log(`next_xp[${user_level.level}][${user.displayName}] : ${next_xp}`);
        
        //     const embed = new MessageEmbed({
        //         author: { name: interaction.guild.name, icon_url: guild.iconURL() },
        //         title: `${user.displayName} [#${rank.findIndex(f => f[0] == user.id)+1} / ${rank.length}]`,
        //         thumbnail: { url: user.displayAvatarURL() },
        //         fields: [
        //             { name: "레벨", value: `${user_level.level}Lvl`, inline: true },
        //             { name: "메시지", value: `${user_level.msg}xp`, inline: true },
        //             { name: "경험치", value: `${user_level.exp}xp`, inline: true },
        //         ],
        //         color: user.displayHexColor,
        //     });
        //     await interaction.reply({ embeds: [embed] });
        // }
    }
}