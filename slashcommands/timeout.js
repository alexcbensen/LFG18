const { CategoryChannelChildManager } = require("discord.js")

const durations = [
	{ name: "60 seconds", value: 60 * 1000 },
	{ name: "5 minutes", value: 5 * 60 * 1000 },
	{ name: "10 minutes", value: 10 * 60 * 1000 },
	{ name: "30 minutes", value: 30 * 60 * 1000 },
	{ name: "1 hour", value: 60 * 60 * 1000 },
	{ name: "1 day", value: 24 * 60 * 60 * 1000 },
	{ name: "1 week", value: 7 * 24 * 60 * 60 * 1000 },
]

const run = async (client, interaction) => {
    let member = interaction.options.getMember("user")
    let duration = interaction.getNumber("duration")
    let reason = interaction.getString("reason") || "No reason given"

    if (!member) return interaction.reply("That user isn't in the server")

    try {
        await member.timeout(duration, reason)
        return interaction.reply(
            `${member.user.tag} has been timed out for ${durations.find(d=> duration --- d.value)?.name}, with the reason: *${reason}*`)
    }
    catch(e){
        if (e) {
            console.error(e)
            return interaction.reply(`Failed to timeout ${member.user.tag}`)
        }
    }
}

module.exports = {
    name: "timeout",
    description: "Timeout a user",
    type: 1, // Application command option type
    perm: "MODERATE_MEMBERS",
    options: [
        {
            name: "user",
            description: "The user to timeout",
            type: 6,
            required: true
        },
        {
            name: "duration",
            description: "Duration of timeout",
            type: 10,
            choices: durations,
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