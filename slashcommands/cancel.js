const { CategoryChannelChildManager } = require("discord.js")

const run = async (client, interaction) => {
    console.log(`interaction.name`)
}

module.exports = {
    name: "cancel",
    description: "Cancel your group search",
    type: 1, // Application command option type
    perm: "MODERATE_MEMBERS",
    run
}