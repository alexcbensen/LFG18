/*
 * Application: LFG Bot
 * Description: Custom Discord bot written for the 'Looking for Group 18+' Discord server
 * Author: Alex Bensen (Vexedly#0002)
 */

const Discord = require("discord.js")
const { Client, GatewayIntentBits, EmbedBuilder, ContextMenuCommandAssertions } = require("discord.js");

// Grab bot token
require("dotenv").config()

// Handlers
const slashcommands = require("./handlers/slashcommands");
const objects = require("./handlers/objects");

// Other modules
const generateEmbed = require("./generateEmbed");

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
    ]
})

let bot = {
    client,
    prefix: "n.",
    owners: ["80768662570545152", "328349306643808257", "237804177676304384", "668993915285667860", "600504533445115905"] // Vexedly, andytastic, Vexedly (second account), cr00kie
}

let feedChannel = "1041577629293224056"
let commandChannel = "1022422781494841354"

client.commands = new Discord.Collection()
client.events = new Discord.Collection()

client.loadEvents = (bot, reload) => require("./handlers/events")(bot, reload)
client.loadCommands = (bot, reload) => require("./handlers/commands")(bot, reload)

client.loadEvents(bot, false)
client.loadCommands(bot, false)

module.exports = bot

// Slash commands
client.on("interactionCreate", (interaction) => {
    if (!interaction.isCommand()) return
    if (!interaction.inGuild()) return interaction.reply("This command can only be used in Looking for Group 18+")
    
    let command = false
    
    .valueOf.console.log(client.slashcommands.size)
    

    if (client.slashcommands.has(interaction.commandName))
        command = client.slashcommands.get(interaction.commandName)
    
    if (!command) { 
        console.log("Command not found")
        return
    }

    console.log(`Running: ${interaction.commandName}`)

    slashcmd.run(client, interaction)
})


// Welcome message
client.on("guildMemberAdd", async (member) => {
    console.log(`${username} has joined the server`)
})

client.login(process.env.TOKEN)