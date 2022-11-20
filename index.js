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

// Define other modules
const generateEmbed = require("./generateEmbed");
const slashcommands = require("./handlers/slashcommands");

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
    prefiix: "n.",
    owners: ["80768662570545152"]
}

client.commands = new Discord.Collection()
client.events = new Discord.Collection()

client.loadEvents = (bot, reload) => require("./handlers/events")(bot, reload)
client.loadCommands = (bot, reload) => require("./handlers/commands")(bot, reload)

client.loadEvents(bot, false)
client.loadCommands(bot, false)

module.exports = bot


client.on("interactionCreate", (interaction) => {
    if (!interaction.isCommand()) return
    if (!interaction.inGuild()) return interaction.reply("This command can only be used in Looking for Group 18+")
    
    // To address: TypeError: Cannot read properties of undefined (reading 'user') error
    const slashcmd = client.slash?.get(interaction?.commandName) // **bot breaks here
    

    if (!slashcmd) {
        console.log(`${interaction.commandName}`)
        return interaction.reply("That isn't a valid slash command")
    }
    if (slashcmd.perms && !interaction.member.permissions.has(slashcmd.perm))
        return interaction.reply("You don't have permissions for this command")

    slashcmd.run(client, interaction)
})


/*
 *  Group Search
 */

// Maps for (player(id), )
const solos = new Map() // One person looking for a group
const duos  = new Map() // Two people
const trios = new Map() // Three people

let numSearching = 0 // Number of groups searching
const lfgQueue = new Map() // Map for (player id, position in queue )

// Map of strings to replace number in reply message
const groupStrs = new Map([
    ['1', "a fourth"],
    ['2', "two more people"],
    ['3', "a squad"],
    ['g', "a fourth"],
])

const sizeMap = new Map([
    ['g', '3'],
    ['group', '3'],
    ['squad', '3'],
    ['3', '3'],
    ['2', '2'],
    ['1', '1'],
])

client.on("messageCreate", (message) => {
    if (message.author.bot) { return } // Ignore if message was sent by a bot

    if (message.content.toLowerCase() == "hi") { message.reply("Hello!") } // Reply "Hello!" when a user says "Hi"

    // Code below this will only execute on messages sent in #bot-commands
    if (message.channel.id != 1022422781494841354) { return }

    
    // Constants
    let player = message.author
    let filteredStr = message.content.replace(/[^a-zA-Z ]/g, " ")
    let content = message.content.toLowerCase()
    let gamemode = "none"
    let validCommand = false
    let groupChar = "" // Bad name, need to change later. It's 4am
    let prefixStr = "" // validSizes is appended to the end of this

    const validSizes = ['g', 'group', 'squad', '1', '2', '3']

    // Makes string clearer to parse
    content = content.replace('builds', 'build') // Ignore s' after "build"
    content = content.replace('zero', 'no')
    content = content.replace('zb', 'no build')
    content = content.replace('one', '1')
    content = content.replace('two', '2')
    content = content.replace('three', '3')

    
    // Array of words in the message
    let words = content.split(" ")

    /* Print words array
    for (let i = 0; i < words.length; i++) {
        console.log(`${words[i]} `)
    }
    */

    // If the message contains "looking for"
    // -1 if a word isn't found
    let lookingIdx = words.indexOf("looking")
    let forIdx = words.indexOf("for")

    if ((lookingIdx + 1 == forIdx) && forIdx > 0) { // if "for" comes after "looking" ex. "looking for group" (and make sure for isn't the first word)
        words.splice(words.indexOf("for"), 1)  // These two lines change "looking" and "for"
        words[words.indexOf("looking")] = "lf" // into "lf"
    }

   // if (words.includes(" ")) console.log("shit")

    // Compare character after "lf" to array of valid chars
    for (let i = 0; i < validSizes.length; i++) {
        let lfChar = validSizes[i]

        if (words.includes("lf" + lfChar)) {
            prefixStr = "lf" + sizeMap.get(lfChar)
            words.splice(words.indexOf("lf" + lfChar), 1)
            groupChar = lfChar
            validCommand = true
            break
        } else if (words.includes("lf")) {
            if (words.indexOf("lf") + 1 < words.length) { // +2, 1 cause index starts at 0, 1 to check if the next word is in bounds 
                //console.log(`${words[words.indexOf("lf")]}`)
                if (words[words.indexOf("lf") + 1] == lfChar) {
                    prefixStr = "lf" + sizeMap.get(lfChar)
                    words.splice(words.indexOf("lf"), 2)
                    validCommand = true 
                    groupChar = lfChar
                    break
                }
            }
        } 

    }

    

    if (prefixStr != "") {
        console.log(`Prefix: ${prefixStr}`)
    }
    

    if (!validCommand) { return }

    if (words.includes("build")) { // If "build is in the message"
        if (words.indexOf("build") - 1 < 0) // If build is the first word, no keyword - ex. builds na east 21+
            gamemode = "build"
        else if (words.indexOf("no") == words.indexOf("build") - 1) // Check if it's "no builds"
            gamemode = "no build" // There's less to do here cause of the word replacement done, above this event trigger
        else {} // Add edge cases
        
    }

    for (let i = 0; i < words.length; i++) {
        //console.log(`${words[i]} `)
    }

    let gamemodeStr = ""

    switch (gamemode) {
        case "build":
            gamemodeStr = "builds"
        case "no build":
            gamemodeStr = "zero build"
        console.log(`${message.author.username}'s looking for ${sizeMap.get(groupChar)} more player(s) to play Fortnite ${gamemodeStr}`)
        message.author.send(`${message.author.username}'s looking for ${sizeMap.get(groupChar)} more player(s) to play Fortnite ${gamemodeStr}`)
    }
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