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
const generateImage = require("./generateImage")
const generateEmbed = require("./generateEmbed")

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
    ]
})

// Triggered when bot logs in
// Javascript - This is called an anonymous function
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`)
})

// Chat reply
client.on("messageCreate", (message) => {

    if (message.content.toLowerCase() == "hi"){
        message.reply("Hello!")
    }
})

const welcomeChannelID = "1008327544954699819"

// Welcome message
client.on("guildMemberAdd", async (member) => {
    let welcomeChannel = client.channels.cache.get(welcomeChannelID)
    let username = member.displayName // Username (obviously)
    let avatarURL = member.user.displayAvatarURL({extension: "png", dynamic: false, size: 256}) // Profile Picture 
    
    //const mentionedUser = userMention(member.id);

    const embed = new EmbedBuilder()
        .setColor(0x2f3136) // Refers to the line to the left of an embedded message
        //.setTitle(`${username}`)
        //.setURL('https://www.youtube.com/watch?v=eBGIQ7ZuuiU') // Rick roll
        .setAuthor({ name: `${username}`, iconURL: avatarURL, url: 'https://www.youtube.com/watch?v=eBGIQ7ZuuiU' }) // Rick roll
        //.setDescription('')
        .setThumbnail('https://i.imgur.com/AfFp7pu.png')
        .addFields( 
            { name: 'We have a new member!', value: `${member.username} has joined the server!` },
            { name: '\u200B', value: '\u200B' },
            { name: 'Inline field title', value: 'Some value here', inline: true },
            { name: 'Inline field title', value: 'Some value here', inline: true },
        )
        .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
        //.setImage(avatarURL)
        .setTimestamp()
        .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

    welcomeChannel.send({ embeds: [embed] })

    // const img = await generateImage(member) // Use image generated using generateImage.js    
})

client.login(process.env.TOKEN)