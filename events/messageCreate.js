<<<<<<< Updated upstream
const Discord = require("discord.js")
=======
const { Discord, EmbedBuilder } = require("discord.js")
const { LfgPost } = require(`../objects/lfgPost.js`)
//let lfgPost = require("../objects/lfgPost.js")

let feedChannel = "1022422781494841354"
let validChannels = ["1022422781494841354", "1041577629293224056", "1048694299228897280"] // Channels commands can be run in

let DEV_CHANNEL = '1022422781494841354'
let LFG_CHANNEL = '1005267543314931783'

validChannels.push("1005267543314931783")

const cannedResponses = new Map([
    ['hi', 'Hello!'],
    ['hello', 'Hello!']
])
>>>>>>> Stashed changes

module.exports = {
    name: "messageCreate",
    run: async function runAll(bot, message) {
        const {client, prefix, owners} = bot
        if (!message.guild) return

        if (message.author.bot) return

        if (!message.content.startsWith(prefix))    
            return

<<<<<<< Updated upstream
=======
        // Message sent from a valid channel (listed in validChannels)
        if (validChannels.includes(message.channel.id)) {
            //const DEV = true
            const USERNAME = member.displayName // Epic Games username
            const CHANNEL = /*(DEV) ? client.channels.cache.get(DEV_CHANNEL) :*/ client.channels.cache.get(LFG_CHANNEL) // #lfg-dev, #lfg

            let newPost = new LfgPost(client, user, member, message)
            //let devPost = null

            if (newPost.isCommand == true) {
                //console.log(newPost.updateStats(USERNAME))
                newPost = LfgPost.prototype.updateStats(member, newPost, client, message, CHANNEL)
                
                /*
                if (DEV) { 
                    devPost = new LfgPost(client, user, member, message)
                    devPost = LfgPost.prototype.updateStats(member, devPost, client, message, CHANNEL)
                }
                */
                //LfgPost.prototype.updateShop(member, newPost, client, message)
                
                //console.log(`${USERNAME}:\n${newPost.OP.STATS}`)
                //console.log(newPost.prototype.updateStats(USERNAME))
                //console.log(newPost.OP.STATS)
            }
            
            delete newPost            
            // Only retrieve Fortite stats if user has their Epic Games account linked
            //if (verified) { console.log(LfgPost.prototype.updateStats(USERNAME) ) }
        }

        // Slash commands below
>>>>>>> Stashed changes
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