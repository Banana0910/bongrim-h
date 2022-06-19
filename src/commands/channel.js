const { CommandInteraction } = require('discord.js')
const { json_update } = require('../api/drive/drive')

module.exports = {
    name: "channel",
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        let data = require('../data.json');
        const group = interaction.options.getSubcommandGroup();
        const channel_id = (interaction.options.getChannel("채널") || interaction.channel).id;
        const guild_id = interaction.guild.id
        if (group == "로그채널") {
            if (interaction.options.getSubcommand() == "설정") {
                if (data.guilds[guild_id].log_channels.indexOf(channel_id) == -1) {
                    data.guilds[guild_id].log_channels.push(channel_id);
                    json_update(data);
                    await interaction.reply(`**${interaction.channel.name}** 채널이 로그채널로 등록되었습니다.`);
                } else {
                    await interaction.reply("이미 등록이 되어있습니다.");
                } 
            } else {
                const index = data.guilds[guild_id].log_channels.indexOf(channel_id)
                if (index != -1) {
                    data.guilds[guild_id].log_channels.splice(index, 1);
                    json_update(data);
                    await interaction.reply(`**${interaction.channel.name}** 채널이 로그채널에서 삭제되었습니다.`);
                } else {
                    await interaction.reply("이 채널은 등록된 적이 없습니다");
                } 
            }
        }
    }
}