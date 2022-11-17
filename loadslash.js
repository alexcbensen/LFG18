const Discord = require("discord.js")
const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config()

const client = new Discord.Client( {intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]} )
let bot = {client}

client.login(process.env.TOKEN)

// Server ID (guilds are how Discord refers to servers)
const guildId = "1002418562733969448"

client.slashcommands = new Discord.Collection()
client.loadSlashCommands = (bot, reload) => require("./handlers/slashcommands")(bot, reload)
client.loadSlashCommands(bot, false)

console.log(`${client.slashcommands.size} slash commands loading`)

// Triggered when bot logs in
// Javascript - This is called an anonymous function
client.on("ready", async () => {
    const guild = client.guilds.cache.get(guildId)

    if(!guild)
        return console.error("Target guild not found")

    await guild.commands.set([...client.slashcommands.values()])

    console.log(`Logged in as ${client.user.tag}`)
    console.log(`${client.slashcommands.size} slash commands loaded successfully`)
    process.exit(0)
})
