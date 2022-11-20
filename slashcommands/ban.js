const { CategoryChannelChildManager } = require("discord.js")

const run = async (client, interaction) => {
    let member = interaction.options.getMember("user")
    let reason = interaction.getString("reason") || "No reason given"

    if (!member) return interaction.reply("That user isn't in the server")

    try {
        await member.ban()
        return interaction.reply(`${member.user.tag} has been banned, with the reason: ${reason}`)
    }
    catch(err){
        if (err) {
            console.error(err)
            return interaction.reply(`Failed to ban ${member.user.tag}`) 
        }
    }
}

module.exports = {
    name: "ban",
    description: "Ban a user",
    type: 1, // Application command option type
    perm: "MODERATE_MEMBERS",
    options: [
        {
            name: "user",
            description: "The user to ban",
            type: 6,
            required: true
        },
        {
            name: "reason",
            description: "Reason for timeout",
            type: 3,
            required: true
        }
    ], run
}