/*
 * Application: LFG Bot
 * Description: Custom Discord bot written for the 'Looking for Group 18+' Discordserver
 * Author: Alex Bensen (Vexedly#0001)
 */

const Discord = require("discord.js")
const { Client, GatewayIntentBits } = require("discord.js");
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

*/

let lfgQueuePos = 0;
let lf1QueuePos = 0;
let lf2QueuePos = 0;

const solos = new Map() // One person looking for a group
const duos = new Map()  // Two people
const trios = new Map() // Three people

const searchType = new Map([
    ['1', "a fourth"],
    ['2', "two more people"],
    ['3', "a squad"],
    ['g', "a fourth"],
])

const usersLooking = new Map()

// Chat reply
client.on("messageCreate", (message) => {
    if (message.content.toLowerCase() == "hi") { message.reply("Hello!") }

    let groupSize = (message.content.slice(2, 3))
    let author = message.author

    let looking = ((message.content.slice(0, 2).toLowerCase()) == "lf") // true if message begins with "lf"
    let validChannel = message.channelId == "1022422781494841354" // bot-commands channel id
    const validChars = ['1', '2', '3', 'g']
    
    if (message.content.slice(2, 3) == 'g') {groupSize = '3'}

    // If lf[value] isn't in the validChars array, ignore the message
    if (!validChars.includes(message.content.slice(2, 3))) { return }

    if(looking && validChannel) {
        if ((message.content.slice(0, 2).toLowerCase()) == "lf") {
            usersLooking.set(author.id, groupSize)

            if(usersLooking.get(author.id)) {v
                message.reply("You're already in the queue")
                return
            }

            switch (groupSize) {
                case "g":
                    solos.set(author.id, lfgQueuePos)
                    break
                case "3":
                    solos.set(author.id, lfgQueuePos)
                    break
                case "2":
                    duos.set(author.id, lf2QueuePos)
                    break
                case "1":
                    trios.set(author.id, lf1QueuePos)
                    break
                default:
                    break
            }
            console.log(`${(groupSize)}`)
            author.send(`You're looking for ${searchType.get(groupSize.toLowerCase())}. Sick`)
            message.delete()
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