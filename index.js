/*
* Application: LFG Bot
* Description: A custom Discord bot written for my Looking for Group 18+ server
* Author: Alex Bensen (Vexedly#0001)
*/

const Discord = require("discord.js")

// Bot token
require("dotenv").config()

const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES"
    ]
})

// Triggered when bot logs in
// Javascript - This is called an anonymous function
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.login(process.env.TOKEN)