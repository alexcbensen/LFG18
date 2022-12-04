const { Discord, EmbedBuilder } = require("discord.js")
const { LfgPost } = require(`../objects/lfgPost.js`)
//let lfgPost = require("../objects/lfgPost.js")

let feedChannel = "1022422781494841354"
let validChannels = ["1022422781494841354", "1041577629293224056", "1048694299228897280"] // Channels commands can be run in

const cannedResponses = new Map([
    ['hi', 'Hello!'],
    ['hello', 'Hello!']
])

module.exports = {
    name: "messageCreate",
    run: async function runAll(bot, message) {
        let user = message.author
        let member = message.member

        let verified = message.member.roles.cache.has('1048428194723803136')

        const {client, prefix, owners} = bot

        if (!message.guild || user.bot || (!bot.owners.includes(user.id))) { return } // Message sent by bot

        // Automated responses, using the cannedResponses map
        if (cannedResponses.has(message.content.toLowerCase())) {
            console.log(`${cannedResponses.get(message.content.toLowerCase())}`)
            client.channels.cache.get(message.channel.id).send(`${cannedResponses.get(message.content.toLowerCase())}`)
        }

        // Message sent from a valid channel (listed in validChannels)
        if (validChannels.includes(message.channel.id)) {
            let post = new LfgPost(client, user, message.content)
            
            if (post == null) { console.log("Not an LFG post")}

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