const Discord = require("discord.js")
let lfgPost = require("../objects/lfgPost.js")

let feedChannel = "1041577629293224056"
let validChannels = ["1022422781494841354"] // Channels commands can be run in

const cannedResponses = new Map([
    ['hi', 'Hello!'],
    ['hello', 'Hello!']
])

module.exports = {
    name: "messageCreate",
    run: async function runAll(bot, message) {
        let member = message.member
        let author = message.author
        let content = message.content

        const {client, prefix, owners} = bot

        //console.log(`Message sent: ${message}`)

        if (!message.guild || author.bot) { return } // A bot sent the message, return

        // Respond to message contained in cannedResponses
        if (cannedResponses.has(message.content.toLowerCase())) {
            console.log(`${cannedResponses.get(message.content.toLowerCase())}`)
            client.channels.cache.get(message.channel.id).send(`${cannedResponses.get(message.content.toLowerCase())}`)
        }

        // Message sent from a valid channel (listed in validChannels)
        if (validChannels.includes(message.channel.id)) {
            if (!bot.owners.includes(author.id)) { return } // Message was sent by a bot, return
            
            // Create lfgPost object
            let post = new lfgPost.LfgPost(member, content)
            lfgPost.create(content)

            delete post
        }

        // Slash commands below
        const args = message.content.slice(prefix.length).trim().split(/ +/g)
        const cmdstr = args.shift().toLowerCase()
        
        let command = client.commands.get(cmdstr)
        if (!command) return

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