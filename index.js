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
//exports.bot = bot


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
const groupPhrase = new Map([
    ['1', "a fourth"],
    ['2', "two more people"],
    ['3', "a squad"],
    ['g', "a fourth"],
])



client.on("messageCreate", (message) => {
    if (message.content.toLowerCase() == "hi") { message.reply("Hello!") } // Reply "Hello!" when a user says "Hi"

    // Constant
    let player = message.author
    let content = message.content.toLowerCase()
    let groupSize = (message.content.slice(2, 3)) // Number of players in the player's group
    let gamemode = "none"

    // Configurable
    let prefix = "lf"
    const validRegions = ["west", "east", "europe"]
    
    if (content.includes("build")) {
        let bldIdx = content.indexOf("build")
        
        // "build" is at the start of a message. Don't try to splice a negative index
        if (bldIdx >= 3) {
        let testStr = content.slice(bldIdx - 3, bldIdx)

            content.indexOf("build") < 3 ? gamemode = "builds" : gamemode = "builds" 

            // check if the message was for no build or zero build, set builds otherwise
            testStr == "ro " || testStr == "no " ? gamemode = "zero build" : gamemode = "builds"
        } else {
            gamemode = "builds"
        }
    }

    switch (gamemode) {
        case "builds":
            console.log(`${message.author.username} wants to play Fortnite builds`)
            player.send(`${message.author.username} wants to play Fortnite builds`)
            break
        case "zero build":
            console.log(`${message.author.username} wants to play Fortnite zero build`)
            player.send(`${message.author.username} wants to play Fortnite zero build`)
            break
    }

    return

    let looking = ((content.slice(0, 2).toLowerCase()) == prefix) // true if message begins with "lf"
    let validChannel = message.channelId == "1022422781494841354" // bot-commands channel id
    const validChars = ['1', '2', '3', 'g'] // One of these chars must immediately follow the prefix
    

    const lfChar = content.slice(2, 3)
    // Disregard the message if it doesn't begin with prefix
    if (!validChars.includes(lfChar)) { return }


    // filter for if a user types lf 1 (with a space)
    if (content.slice(2, 3) == 'g') {groupSize = '3'}

    if(looking && validChannel) {
        if ((content.slice(0, 2).toLowerCase()) == prefix) { // If message begins with prefix
            lfgQueue.set(player.id, groupSize) // log (player id, size of group they *currently* have)

            if(lfgQueue.get(player.id)) {
                message.reply("You're already in the queue")
                return
            }

            switch (groupSize) {
                case "g":
                    solos.set(player.id, lfgQueuePos)
                    break
                case "1":
                    solos.set(player.id, lfgQueuePos)
                    break
                case "2":
                    duos.set(player.id, lf2QueuePos)
                    break
                case "3":
                    trios.set(player.id, lf1QueuePos)
                    break
                default:
                    break
            }
            
            console.log(`${(groupSize)}`)
            author.send(`You're looking for ${groupPhrase.get(groupSize.toLowerCase())}. Sick`)
            //message.delete()
        }
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