module.exports = {
    name: "eval",
    /** 
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const code = interaction.options.getString("코드");
        try { interaction.reply(`실행한 코드 \`${code}\`\n\`\`\`${eval(code)}\`\`\``); }
        catch(e) { interaction.reply(`실행한 코드 \`${code}\`\n\`\`\`${e}\`\`\``); }
    }
}