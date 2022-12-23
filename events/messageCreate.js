const { Discord, EmbedBuilder, messageLink, WebhookClient } = require("discord.js")
const { LfgPost } = require(`../objects/lfgPost.js`)
const { StatsPost } = require(`../objects/statsPost.js`)
const { debug } = require('../debug.json');
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
        if ( message.reference || message.author.bot ) { return }
        
        const { client, prefix, owners } = bot
        const user = message.author
        const username = message.member.displayName
        const verified = message.member.roles.cache.has('1048428194723803136') || message.member.roles.cache.has('1048724073057898526')
        
        if ( !message.guild ) { return }


        // Automated responses, using the cannedResponses map
        if ( cannedResponses.has(message.content.toLowerCase()) && ( debug == false )) {

            // Reply to the user's message with the a value from the map. The user's message is used as the key ex. 'hi'
            client.channels.cache.get(message.channel.id).send(`${cannedResponses.get(message.content.toLowerCase())}`)
        }

         // Epic Games
        if (message.channel.id == '1022422781494841354') {
            if (message.content.toLowerCase()[0] == 'm' && message.content.toLowerCase()[1] == ' ') {
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
            }
        }
                                     // Stats-dev            // Stats
        let statsChannel = (debug) ? '1054899385194004501' : '1052015503998210088'
        
        /** LFG Posts disabled in 'debug' mode **/
        if ( validChannels.includes(message.channel.id) && (debug == false) ) { // LFG Post
            const member = message.member

            let newPost = new LfgPost(client, user, member, message)
            
            if (newPost.isCommand == true) {
                //console.log(newPost.updateStats(username))
                newPost = LfgPost.prototype.updateStats(member, newPost, client, message)
                //LfgPost.prototype.updateShop(member, newPost, client, message)
                
                //console.log(`${username}:\n${newPost.OP.STATS}`)
                //console.log(newPost.prototype.updateStats(username))
                //console.log(newPost.OP.STATS)
            }
            
            delete newPost            

            // Only retrieve Fortite stats if user has their Epic Games account linked
            //if (verified) { console.log(LfgPost.prototype.updateStats(username) ) }
        } else if ( message.channel.id == statsChannel ) { // Stats
            if ( message.content.toLowerCase() == 'stats' ) {
                if (verified) {
                    console.log(`Getting stats for\n• ${message.member.displayName}`)
                    let extraStats = new Map([])
                    
                    if (extraAccounts.has(message.member.id)) {
                        let extraAccName = extraAccounts.get(message.member.id)
                        
                        StatsPost.prototype.getExtraStats(extraAccName).then( extraStats => {
                            console.log(`• ${extraAccName} - second account`)
                            
                            let statsPost = new StatsPost(message, extraStats)
                            delete statsPost
                        })
                    } else {
                        let statsPost = new StatsPost(message, extraStats)
                        delete statsPost
                    }
                }
            }
        }
    }
}