const { CommandInteraction, MessageEmbed } = require("discord.js");
const { json_update } = require("../api/drive/drive");

module.exports = {
    name: "autorole",
    /** 
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        let data = require("../data.json");
        const guild = interaction.guild;
        const subcommand = interaction.options.getSubcommand();
        if (subcommand == "활성화") {
            if (data.guilds[guild.id].autorole) {
                await interaction.reply("이미 자동 권한 부여 기능이 설정되어있습니다");
                return;
            }
            const bot_role = interaction.options.getRole("봇");
            const user_role = interaction.options.getRole("유저");

            data.guilds[guild.id].autorole = {
                bot_role: bot_role.id,
                user_role: user_role.id
            }
            json_update(data, 0);
            if (data.guilds[guild.id].autorole) await interaction.reply("자동 권한 부여 기능이 수정되었습니다!");
            else await interaction.reply("자동 권한 부여 기능이 활성화되었습니다!");
        } else if (subcommand == "비활성화") {
            if (!data.guilds[guild.id].autorole) {
                await interaction.reply("자동 권한 부여 기능이 설정된적이 없는데요..?");
                return;
            }
            delete data.guilds[guild.id].autorole;
            json_update(data);
            await interaction.reply("자동 권한 부여 기능이 비활성화되었습니다..");
        } else if (subcommand == "상태") {
            if (!data.guilds[guild.id].autorole) {
                await interaction.reply("자동 권한 부여 기능이 비활성화되있습니다..");
                return;
            }

            const role = data.guilds[guild.id].autorole
            const bot_role = guild.roles.cache.get(role.bot_role);
            const user_role = guild.roles.cache.get(role.user_role);
    
            if (!bot_role || !user_role) { // 권한이 존재하는지 확인
                delete data.guilds[guild.id].autorole;
                json_update(data, 0);
                await interaction.reply("자동 권한 부여 기능에 설정된 권한이 삭제되어\n기능을 비활성화시켯습니다\n추후에 다시 추가해 주시기 바랍니다.");
                return;
            }

            await interaction.reply({ 
                content: "자동 권한 부여 기능이 활성화 되있으며, 설정 사항은 다음과 같습니다.",
                embeds: [ new MessageEmbed({
                    title: "자동 권한 부여 기능",
                    fields: [
                        { name: "봇 권한", value: `<@&${bot_role.id}>`, inline: true },
                        { name: "유저 권한", value: `<@&${user_role.id}>`, inline: true }
                    ],
                    color: interaction.guild.me.displayHexColor
                })]
            })
        }
    }
}