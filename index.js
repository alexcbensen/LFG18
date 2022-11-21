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

let feedChannel = "1041577629293224056"
let commandChannel = "1022422781494841354"

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
    ['three', '3'],
    ['few', '3'],
    ['two', '2'],
    ['couple', '2'],
    ['one', '1'],
    ['3', '3'],
    ['2', '2'],
    ['1', '1'],
])

let ignWords = ['a']

client.on("messageCreate", (message) => {
    if (message.author.bot) { return } // Ignore if message was sent by a bot

    if (message.content.toLowerCase() == "hi") { message.reply("Hello!") } // Reply "Hello!" when a user says "Hi"

    // Code below this will only execute on messages sent in #bot-commands
    if (message.channel.id != commandChannel) { return }

    
    // Constants
    let player = message.author
    let username = message.author.username
    let filteredStr = message.content.replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, ' ');
    let content = message.content.toLowerCase()
    let gamemode = "none"
    let prefixStr = "" // Examples: "lfg", "lf1", "lf2", "lf3"
    let gapTolerance = 2

    // validSizes is redundent with the map. I'll make this more concise during one of my rewrites
    const validSizes = ['g', 'group', 'squad', '1', '2', '3', 'one', 'two', 'three', 'couple', 'few']
    const validSep = 2 // Number of words that will be ignored if they come in between "lf" and a string from validSizes

    // Makes string clearer to parse
    content = content.replace('builds', 'build') // Ignore s' after "build"
    content = content.replace('zero', 'no')
    content = content.replace('zb', 'no build')
    
    // Array of words in the message
    let words = content.split(" ")

    /* Print words array
    for (let i = 0; i < words.length; i++) {
        console.log(`${words[i]} `)
    }
    */
    
    // If the message contains "looking for"
    // -1 if a word isn't found

    if ((words.indexOf("looking") + 1 == words.indexOf("for")) && words.indexOf("for") > 0) { // if "for" comes after "looking" ex. "looking for group" (and make sure for isn't the first word)
        words.splice(words.indexOf("for"), 1)  // These two lines change "looking" and "for"
        words[words.indexOf("looking")] = "lf" // into "lf"
        console.log("Converted lf string")
    }
    
    // Compare character after "lf" to *all* validSizes - This can be more efficient, rewrite
    for (let i = 0; i < validSizes.length; i++) {
        let validSize = validSizes[i]

        /* CASE: Case: If "lf" is in the message, and immediately followed by a validSize
         * Examples: "lf1", "lf2", "lf3"
         */
        if (words.includes("lf" + validSize)) {
            prefixStr = "lf" + sizeMap.get(validSize) // Update prefixStr with proper format
            break
            
        /* CASE: If "lf" isn't immediately followed by a validSize
         * Example(s): "lf g", "lf 2"
         * -- Check if the next word is a validSize
        */    
        } else if (words.includes("lf")) {
            let curIdx = words.indexOf("lf")
            let nextIdx = curIdx + 1
            let wordsChecked = 0
            let curGap = 0

            let nextWord = ""

            // Check up to (gapTolerance) words, if they're in the ignored
            while (curGap < gapTolerance) {
                nextWord = words[nextIdx]

                // Do nothing if no words follow "lf"
                if(nextIdx >= words.length) { break }

                if (ignWords.includes(nextWord)) {
                    //console.log(`${nextWord} *ignored*`)
                } else {
                    if (nextWord == validSize) {
                        prefixStr = "lf" + sizeMap.get(validSize)
                        break
                    } else {
                        nextWord = words[nextIdx + curGap]
                    }
                }

                curGap++
                nextIdx++
            }
        } 
    }

    // Stops here if command is invalid
    // if prefixStr is empty, the command was invalid. prefixStr is only filled whhen valid commands are executed
    if (prefixStr == "") { return } else { console.log(`${prefixStr}`) }
    
    if (words.includes("build")) { // If "build is in the message"
        if (words.indexOf("build") - 1 < 0) { return } // If build is the first word, no keyword - ex. builds na east 21+

        if (words.indexOf("no") == words.indexOf("build") - 1) // Check if it's "no builds"
            gamemode = "no build" // There's less to do here cause of the word replacement done, above this event trigger
        else { gamemode = "build" } // Add edge cases

        console.log(`${gamemode}`)
    }

    for (let i = 0; i < words.length; i++) {
        //console.log(`${words[i]} `)
        // lf3 sqauds zero build 18+ => need 3 
        // lf2 squads zero build 18+ => need 2
        // Lf 1 for duo => need 1
        // lf2 trios zero build 18+  => need 1
        // lf1 trios zero build 18+  => need 2
        // lf more
        // lf two more
    }

    let groupChar = prefixStr[2] // Size of group the player is looking for

    let gamemodeStr = ""
    console.log("test")
    switch (gamemode) {
        case "build":
            gamemodeStr = "builds"
        case "no build":
            gamemodeStr = "zero build"
        default: { }

        client.channels.cache.get(feedChannel).send(`${username}'s looking for ${groupChar} more player(s) to play Fortnite ${gamemodeStr}`)
        console.log(`${username}'s looking for ${groupChar} more player(s) to play Fortnite ${gamemodeStr}`)
        //player.send(`${username}'s looking for ${groupChar} more player(s) to play Fortnite ${gamemodeStr}`)
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