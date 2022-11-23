const Discord = require("discord.js")
let lfgPost = require("../objects/lfgPost.js")

let feedChannel = "1041577629293224056"
let commandChannel = "1022422781494841354"

module.exports = {
    name: "messageCreate",
    run: async function runAll(bot, message) {
        const {client, owners} = bot
        //console.log(`Message sent: ${message}`)

        if (!message.guild || message.author.bot) { return }

        // Code below this will only execute on messages sent in #bot-commands
        if (message.channel.id != commandChannel) { return }

        let sender = message.author
        let username = sender.username
        let lowerCase = message.content.toLowerCase()
        // Messy, but trying to maintain functionality. I'll make this more efficient on the next pass-through
        lowerCase = lowerCase.replace('builds', 'build') // Ignore s' after "build"
        lowerCase = lowerCase.replace('zero', 'no')
        lowerCase = lowerCase.replace('zb', 'no build')
        //let filteredMsg = message.content.toLowerCase().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, ' ');
        let filteredMsg = lowerCase.split(" ")

        // Say hi
        if (message.content.toLowerCase() == "hi") { message.reply("Hello!") } // Reply "Hello!" when a user says "Hi"

        // Only run commands below this is they're triggered by an admin
        if (!bot.owners.includes(sender.id)) { return }

        // Lfg command

        let post = new lfgPost.LfgPost(sender, message) // Pass whole sentence instead of filteredMsg(words)

        if (lfgPost.isValid(filteredMsg)) {}

        delete post

        return

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
            let erMsg = err.toString()

            if(errMsg.startsWith("?")) {
                errMsg = errMsg.slice(1)
                await message.reply(errMsg)
            }
            else
                console.error(err)

        }
    }
}