const Discord = require("discord.js")
let lfgPost = require("../objects/lfgPost.js")

let feedChannel = "1041577629293224056"
let validChannels = ["1022422781494841354"] // Channels commands can be run in

const responses = new Map([
    ['hi', 'Hello!'],
    ['hello', 'Hello!']
])

module.exports = {
    name: "messageCreate",
    run: async function runAll(bot, message) {
        //console.log(`Message sent: ${message}`) 

        let author = message.author

        const {client, prefix, owners} = bot

        if (!message.guild || author.bot) { return } // A bot sent the message, return
        if (!validChannels.includes(message.channel.id)) { return } // The message wasn't sent in the specified channel

        // Say hi (add to map of "canned responses")
        if (responses.has(message.content.toLowerCase())) {
            console.log(`${responses.get(message.content.toLowerCase())}`)
        } // Reply "Hello!" when a user says "Hi"

        // Only run commands below this is they're triggered by an admin
        if (!bot.owners.includes(author.id)) { return }

        let post = new lfgPost.LfgPost(author, message) // Lfg command

        if (lfgPost.isValid(message)) {}

        delete post

        // Slash commands below
        const args = message.content.slice(prefix.length).trim().split(/ +/g)
        const cmdstr = args.shift().toLowerCase()
        
        let command = client.commands.get(cmdstr)
        if (!command) return

        let member = message.member

        if(command.devOnly && !owners.includes(member.id)) {
            return message.reply("This command is only available to the bot owner")
        }

        if(command.permissions && member.permissions.missing(command.permissions).length !== 0) {
            return message.reply("You don't have permission for this command")
        }

        try {
            await command.run({...bot, message, args})
        }
        catch(err) {
            let errMsg = err.toString()

            if(errMsg.startsWith("?")) {
                errMsg = errMsg.slice(1)
                await message.reply(errMsg)
            }
            else
                console.error(err)

        }
    }
}