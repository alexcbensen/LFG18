const { Discord, EmbedBuilder, messageLink, WebhookClient } = require("discord.js")
const { LfgPost } = require(`../objects/lfgPost.js`)
const { StatsPost } = require(`../objects/statsPost.js`)
//let lfgPost = require("../objects/lfgPost.js")

let validChannels = ["1041577629293224056", "1048694299228897280"] // Channels commands can be run in

validChannels.push("1005267543314931783")

const cannedResponses = new Map([
    ['hi', 'Hello!'],
    ['hello', 'Hello!']
])

const extraAccounts = new Map([
    ['80768662570545152', 'VexedlyPS'], // Discord ID, extra Epic account ID
    ['970757498019663952', 'xchxrch']
])

module.exports = {
    name: "messageCreate",
    run: async function runAll(bot, message) {
        let debug = process.env.DEBUG

        if (debug == 'true') { debug = true }
        else if (debug == 'false') { debug = false }
        else {
            console.log(`Debug mode in .env must be 'true' or 'false'`)
            return
        }

        let user = message.author

        if (message.reference) {return} // Message is a reply
        if ( !message.guild || user.bot ) { return } // Message sent by bot

        let verified = message.member.roles.cache.has('1048428194723803136') || message.member.roles.cache.has('1048724073057898526')

        const {client, prefix, owners} = bot

        //if (!bot.owners.includes(user.id)) { return }

        // Automated responses, using the cannedResponses map
        if (cannedResponses.has(message.content.toLowerCase()) && (debug == false)) {

            // Reply to the user's message with the a value from the map. The user's message is used as the key ex. 'hi'
            client.channels.cache.get(message.channel.id).send(`${cannedResponses.get(message.content.toLowerCase())}`)
        }

        const USERNAME = message.member.displayName // Epic Games


        if (message.channel.id == '1022422781494841354') {

            // This is a terrible way of handling commands. It'll be changed as soon as I implement slash (commands)
            if (message.content.toLowerCase()[0] == 'f' && message.content.toLowerCase()[1] == ' ') {
                const toParse = message.content.slice(2, message.length).split(' ')

                const epicName = toParse[0]
                const discordID = toParse[1]

                const guild = client.guilds.cache.get('1002418562733969448')
                //console.log(guild.members.cache)
                const discordMember = guild.members.cache.get(discordID)
                //console.log(`Epic Name: ${epicName}`)
                //console.log(`Discord ID: ${discordID}`)

                const myID = '80768662570545152'
                
                if (message.member.id == myID) {
                    let test = ''
                    try { test = discordMember.displayName } catch (error) {
                        //console.error(error);
                        console.log(`Discord user must be in a voice channel:\n${discordMember} \nBot is still running`)
                        message.reply(`Still working on the bot, stats command didn't work :(`)
                        return
                    }

                    let statsPost = new StatsPost(message, client, epicName, discordMember, debug, [])
                    delete statsPost
                }
            } else if (message.content.toLowerCase()[0] == 'm' && message.content.toLowerCase()[1] == ' ') {
                const content = message.content.slice(2, message.length)
                
                let webhookClient = null

                webhookClient = new WebhookClient({ id: process.env.MESSAGE_ID, token: process.env.MESSAGE_HOOK});
                
                webhookClient.send({
                    content: content,
                    username: 'Fortnite 18+',
                    avatarURL: 'https://i.imgur.com/3KfaSkX.png', // Fortnite bot png
                    //embeds: embedArr
                })
            } else if (message.content.toLowerCase() == 'api') {
                console.log( `Response:\n${StatsPost.prototype.testAPI()}` )
            } else {}
        }
                                     // Stats-dev            // Stats
        let statsChannel = (debug) ? '1054899385194004501' : '1052015503998210088'
        
        /** LFG Posts disabled in 'debug' mode **/
        if ( (debug == false) && validChannels.includes(message.channel.id) ) { // LFG Post
            const member = message.member

            let newPost = new LfgPost(client, user, member, message)
            
            if (newPost.isCommand == true) {
                //console.log(newPost.updateStats(USERNAME))
                newPost = LfgPost.prototype.updateStats(member, newPost, client, message)
                //LfgPost.prototype.updateShop(member, newPost, client, message)
                
                //console.log(`${USERNAME}:\n${newPost.OP.STATS}`)
                //console.log(newPost.prototype.updateStats(USERNAME))
                //console.log(newPost.OP.STATS)
            }
            
            delete newPost            
            // Only retrieve Fortite stats if user has their Epic Games account linked
            //if (verified) { console.log(LfgPost.prototype.updateStats(USERNAME) ) }
        } else if ( message.channel.id == statsChannel ) { // Stats
            if ( message.content.toLowerCase() == 'stats' ) {
                if (verified) {                  // Discord ID         // Epic games account ID 
                    let extraStats = new Map([]) //'80768662570545152', ])
                    
                    if (extraAccounts.has(message.member.id)) { //xchxrch
                        let extraAccName = extraAccounts.get(message.member.id)
                        
                        StatsPost.prototype.getExtraStats(extraAccName).then( extraStats => {
                            console.log(`${message.member.displayName} has alt account ${extraAccName}- combining stats`)
                            
                            let statsPost = new StatsPost(message, client, USERNAME, message.member, debug, extraStats)
                            delete statsPost
                        })
                    } else {
                        let statsPost = new StatsPost(message, client, USERNAME, message.member, debug, extraStats)
                        delete statsPost
                    }

                    if (debug) console.log(`${message.member.displayName}'s stats were posted in ${message.channel.name}`)
                }
            }
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