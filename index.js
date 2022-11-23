/*
 * Application: LFG Bot
 * Description: Custom Discord bot written for the 'Looking for Group 18+' Discordserver
 * Author: Alex Bensen (Vexedly#0001)
 */

const Discord = require("discord.js")
const { Client, GatewayIntentBits, ContextMenuCommandAssertions } = require("discord.js");
const { EmbedBuilder } = require('discord.js');

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
    owners: ["80768662570545152", "328349306643808257"] // Vexedly, andytastic
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
    
    // To address: TypeError: Cannot read properties of undefined (reading 'user') error
    const slashcmd = client.slash?.get(interaction?.commandName) // **bot breaks here
    //const slashcmd = client.slashCommands.get(interaction.name)  // Possible fix
     

    if (!slashcmd) {
        console.log(`${interaction.commandName}`)
        return interaction.reply("That isn't a valid slash command")
    }
    if (slashcmd.perms && !interaction.member.permissions.has(slashcmd.perm))
        return interaction.reply("You don't have permissions for this command")

    slashcmd.run(client, interaction)
})

const welcomeChannelID = "1008327544954699819"

// Welcome message
client.on("guildMemberAdd", async (member) => {
    let welcomeChannel = client.channels.cache.get(welcomeChannelID)
    let username = member.displayName // Username (obviously)
    let avatarURL = member.user.displayAvatarURL({extension: "png", dynamic: false, size: 256}) // Profile Picture 
    // member.user.tag
    //const mentionedUser = userMention(member.id);

    const embed = new EmbedBuilder()
        .setColor(0x2f3136) // Refers to the line to the left of an embedded message
        //.setTitle(`${username}`)
        //.setURL('https://www.youtube.com/watch?v=eBGIQ7ZuuiU') // Rick roll
        .setAuthor({ name: `${username}`, iconURL: avatarURL, url: 'https://www.youtube.com/watch?v=eBGIQ7ZuuiU' }) // Rick roll
        //.setDescription('')
        .setThumbnail('https://i.imgur.com/AfFp7pu.png')
        .addFields( 
            { name: 'We have a new member!', value: `${username} has joined the server!` },
            { name: '\u200B', value: '\u200B' },
            { name: 'Inline field title', value: 'Some value here', inline: true },
            { name: 'Inline field title', value: 'Some value here', inline: true },
        )
        .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
        //.setImage(avatarURL)
        .setTimestamp()
        .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

    welcomeChannel.send({ embeds: [embed] })

    console.log(`${username} has joined the server`)
})

client.login(process.env.TOKEN)