const { Discord, EmbedBuilder, WebhookClient } = require("discord.js")
const { request } = require('undici')
const { StatsPost } = require(`../objects/statsPost.js`)

// * To do: Read consts from file *
// const { SIZE_MAP, SEARCH_TYPES } = require('consts.js')

let player = require("../objects/player.js")

let lfgChannel = '1005267543314931783'

const debug = false

// Assignments for lf group size, depending on given text input
// By "lf group size", I mean the number of players the user wants to search for
const sizeMap = new Map([
    ['g', 3],
    ['group', 3],
    ['squad', 3],
    ['three', 3],
    ['trio', 3],
    ['few', 3],
    ['two', 2],
    ['duo', 2],
    ['couple', 2],
    ['one', 1],
    ['3', 3],
    ['2', 2],
    ['1', 1],
    [3, 3],
    [2, 2],
    [1, 1],
    ['none', 'none'],
])

// If the key is in the message, queue will be set to the value
// 4 is squads, 3 is trios, and 2 is duos
const queueMap = new Map([
    ['squads', 4],
    ['trios', 3],
    ['duos', 2],
    ['squad', 4],
    ['trio', 3],
    ['duo', 2]
])

// Map for message output
const queueStrs = new Map([
    [4, "Squads"],
    [3, "Trios"],
    [2, "Duos"],
])

const strReplacements = new Map([
    [1, '**1** player'],
    [2, '**2** players'],
    [3, '**3** players'],
    ['builds',     'Battle Royale - Builds'],
    ['zero build', 'Zero Build - Battle Royale'],
])
function LfgPost(client, user, member, messageObj) {
    let newPlayer = new player.Player(user)
    let verified = member.roles.cache.has('1048428194723803136')
    let message = messageObj.content
    
    this.message = message

    let [ command, messageArray , playersReq] = LfgPost.prototype.findPlayersReq(message)
    this.isCommand = command

    if (member.id == '80768662570545152') verified = true
    
    if (command) {
        newPlayer.name = user.username
        newPlayer.tag  = user.discriminator
        newPlayer.region = LfgPost.prototype.findRegion(messageArray)
        newPlayer.gamemode = LfgPost.prototype.findGamemode(messageArray)
        newPlayer.ageReq = LfgPost.prototype.findAgeRq(messageArray)
        newPlayer.queue  = LfgPost.prototype.findQueue(messageArray) 
        newPlayer.playersReq = playersReq
        
        if (newPlayer.queue == 'none') { newPlayer.queue = 4 }
        
        this.OP = newPlayer
        this.OP.verified = verified
        this.content = messageArray
        this.minAge = -1

        return this
    }
}

LfgPost.prototype.updateStats = function (member, post, client, message) {
    const userRequestURL = 'https://fortnite-api.com/v2/stats/br/v2'
    const ApiKey = process.env.FORTNITE_API_KEY

    const USERNAME = member.displayName

    fetch( userRequestURL + '?name=' + USERNAME, { headers: { Authorization: ApiKey }} )
    .then( response => { return response.json().then( data => {
            if (data.status == 200) {
                post.OP.STATS.LEVEL = data.data.battlePass.level
                post.OP.STATS.KILLS = data.data.stats.all.overall.kills
                post.OP.STATS.USERNAME  = data.data.account.name
                post.OP.STATS.KD_RATIO  = data.data.stats.all.overall.kd
                post.OP.STATS.SOLO_WINS = data.data.stats.all.solo.wins
                post.OP.STATS.WIN_RATE  = data.data.stats.all.overall.winRate
                post.OP.STATS.MATCHES_PLAYED = data.data.stats.all.overall.matches
                post.OP.STATS.LAST_MODIFIED  = data.data.stats.all.overall.lastModified

                let embed = LfgPost.prototype.createMessage(client, lfgChannel, message.content, post, post.OP.verified)

                //client.channels.cache.get((lfgChannel)).send({embeds: [embed]})
                message.reply({embeds: [embed]})
                
                return post
            }
        });
    });
}

LfgPost.prototype.displayStats = function(member, post, client, message) {
    const userRequestURL = 'https://fortnite-api.com/v2/stats/br/v2'
    const ApiKey = process.env.FORTNITE_API_KEY

    const USERNAME = member.displayName
    
    //console.log(`\nGetting ${USERNAME}'s stats`)
    
    fetch( userRequestURL + '?name=' + USERNAME, { headers: { Authorization: ApiKey }} )
    .then( response => { return response.json().then( data => {
        const embed = new EmbedBuilder()

        //const webhookClient = new WebhookClient({ id: process.env.HOOK_ID, token: process.env.HOOK_TOKEN});
        
        const statToStr = new Map([
            ['score', 'Score'],
            ['scorePerMatch', 'Score per match, average'],
            ['wins', 'Total wins'],
            ['top10', 'Top 10 placements'],
            ['kills', 'Total kills'],
            ['killsPerMatch', 'Average kills per match'],
            ['deaths', 'Total Deaths'],
            ['kd', 'k/d'],
            ['matches', 'Total matches played'],
            ['winRate', 'Win rate'],
            ['minutesPlayed', 'Hours played'],
        ])

        for (const stat in data.data.stats.all.overall) {
            
            if ( statToStr.has(stat) ) {
                //console.log(`${statToStr.get(stat)}: ${data.data.stats.all.overall[stat]}`)


                embed.setTitle(`${USERNAME}`)
                embed.setThumbnail('https://i.imgur.com/h9jaSKC.png')
                embed.addFields({ name: `${statToStr.get(stat)}`, value: `${data.data.stats.all.overall[stat]}`})
                embed.setFooter({ text: ` `, iconURL: 'https://i.imgur.com/h9jaSKC.png' });
                embed.setColor(0x2f3136)
                
                // https://i.imgur.com/h9jaSKC.png // LFG Bot
                // https://i.imgur.com/HgragK2.png // Chistmas LFG Bot - low resolution
                // https://i.imgur.com/pi35BxM.png // LFG Bot - first upload ( I think )
            }
        }

        /*webhookClient.send({
            content: 'New **daily** items available',
            username: 'Fortnite Shop',
            avatarURL: 'https://i.imgur.com/OfDWRMc.png',
            embeds: embedArr
        })
*/
        client.channels.cache.get(('1052002403123216454')).send({embeds: [embed]})

        });
    });
}

LfgPost.prototype.updateShop = function(member, post, client, message) {
    const userRequestURL = 'https://fortnite-api.com/v2/shop/br/combined'
    const ApiKey = process.env.FORTNITE_API_KEY

    const USERNAME = member.displayName

    fetch( userRequestURL + '?name=' + USERNAME, { headers: { Authorization: ApiKey }} )
    .then( response => { return response.json().then( data => {
        let embedArr = []

        const webhookClient = new WebhookClient({ id: process.env.HOOK_ID, token: process.env.HOOK_TOKEN});

        //console.log(data.data.dail.entries)
        data.data.daily.entries.forEach(entry => {
            entry.items.forEach(item => {
                let firstAvailable = item.shopHistory[0]
                let lastAvailable = item.shopHistory[item.shopHistory.length - 2]
                firstAvailable = firstAvailable.slice(0, firstAvailable.length - 11).split('-')
                lastAvailable = lastAvailable.slice(0, lastAvailable.length - 11).split('-')
                
                const monthStr = new Map([
                    ['01', 'January'],
                    ['02', 'February'],
                    ['03', 'March'],
                    ['04', 'April'],
                    ['05', 'May'],
                    ['06', 'June'],
                    ['07', 'July'],
                    ['08', 'August'],
                    ['09', 'September'],
                    ['10', 'October'],
                    ['11', 'November'],
                    ['12', 'December'],
                ])

                const DATE_LAST = {
                    DAY:   lastAvailable[2],
                    MONTH: lastAvailable[1],
                    YEAR:  lastAvailable[0],
                }

                const DATE_FIRST = {
                    DAY:   firstAvailable[2],
                    MONTH: firstAvailable[1],
                    YEAR:  firstAvailable[0],
                }

                const embed = new EmbedBuilder()
                .setColor(0x2f3136) // Refers to the line to the left of an embedded message
                //.setTitle(`${item.name}`)
                .setThumbnail(item.images.icon)
                .addFields({ name: `${item.name}`, value: `${item.description}`})
                .addFields({ name: `History`, value: `Last on sale: ${monthStr.get(DATE_LAST.MONTH)} ${DATE_LAST.YEAR}\nReleased: ${monthStr.get(DATE_FIRST.MONTH)} ${DATE_FIRST.YEAR}`})
                .setFooter({ text: ` `, iconURL: 'https://i.imgur.com/pi35BxM.png' });

                // https://i.imgur.com/h9jaSKC.png // LFG Bot
                // https://i.imgur.com/HgragK2.png // Chistmas LFG Bot - low resolution
                // https://i.imgur.com/pi35BxM.png // LFG Bot - first upload ( I think )
                /*

                let dailyChannel = client.channels.cache.get(('1049458524599636069'))
                
                const thread = dailyChannel.threads.create({
                    name: `Daily items: ${monthStr.get(DATE.MONTH)}`,
                    autoArchiveDuration: 1,
                    reason: 'New daily items'
                })
                */
                
                embedArr.push(embed)
            })
        })
        //console.log(embeds)
        
        webhookClient.send({
            content: 'New **daily** items available',
            username: 'Fortnite Shop',
            avatarURL: 'https://i.imgur.com/OfDWRMc.png',
            embeds: embedArr
        })


        //client.channels.cache.get(('1049457107449171999')).send({embeds: [embed]})
        
        });
    });
}

LfgPost.prototype.findPlayersReq = function (message) {
    let messageArray = LfgPost.prototype.format(message)
    let command = false
    let playersReq = 0

    if (debug) console.log(`Parsing words: ${messageArray}`)

    for (let [sizeStr, plReq] of sizeMap) {
         // Examples: "lf1", "lf2", "lf3"
        if (messageArray.includes("lf" + sizeStr)) {
            playersReq = plReq
            command = true
            break
        }
    }
    
    if (command == false) {
        let plReq = LfgPost.prototype.findLF(messageArray)
        
        if (plReq != 'none') {
            command = true
            playersReq = plReq
        }
    }

    return [command, messageArray, playersReq]
}

LfgPost.prototype.createMessage = function (client, channelID, content, post, verified) {
    let channel = client.channels.cache.get(channelID)
    
    //const mentionedUser = userMention(member.id);

    let party = {
        playerName: post.OP.name,
        size: (post.OP.queue - post.OP.playersReq),
        capacity: post.OP.queue,
        playersReq: post.OP.playersReq,
        gamemode: (post.OP.gamemode == 'none') ? 'Fortnite' : strReplacements.get(post.OP.gamemode),
        players: strReplacements.get(post.OP.playersReq),
        queue: queueStrs.get(post.OP.queue),
        avatarURL: post.OP.avatarURL,
        lfString: ' ',
        verified: {
            level: post.OP.STATS.LEVEL,
            matchesPlayed: post.OP.STATS.MATCHES_PLAYED.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") // Add commas
            }
    }

    if (debug) console.log(party)

    party.lfString = strReplacements.get(party.playersReq)
 
    return LfgPost.prototype.createEmbed(channel, party, verified)
}

LfgPost.prototype.createEmbed = function (channel, party, verified) {
    const embed = new EmbedBuilder()
    .setColor(0x2f3136) // Refers to the line to the left of an embedded message
    .setTitle(`${party.gamemode}`)
    //.setURL('https://www.youtube.com/watch?v=eBGIQ7ZuuiU') // Rick roll
    //.setAuthor({ name: `header`, iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://www.youtube.com/watch?v=eBGIQ7ZuuiU' }) // Rick roll
    //.setDescription(`Desription`)
    .setThumbnail(party.avatarURL)
    //.addFields({ name: 'Battle Royale', value: `${gamemode}`, inline: true })
    .addFields({ name: `Looking For`, value: `${party.lfString} for ${party.queue}`})
    //.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
    
    //.addFields({ name: 'Inline field title', value: 'Some value here'})
    //.addFields({ name: 'test', value: `${content}`}) // Display origonal message
    //.setTimestamp()
    // https://i.imgur.com/pi35BxM.png  // LFG Bot
    if ( verified == true ) {
        //embed.addFields({ name: 'Stats', value: `??? Level: ${party.verified.level}\n??? ${party.verified.matchesPlayed} matches played`, inline: true})
        embed.setFooter({text: `??? ${party.verified.matchesPlayed} matches played`})
    }

    return embed
}

LfgPost.prototype.findRegion = function (messageArray) {    
    let regions = []

    if (messageArray.includes('naw')) regions.push('naw')
    if (messageArray.includes('nae')) regions.push('nae')
    if (messageArray.includes('eu')) regions.push('eu')        

    return regions
}

LfgPost.prototype.findAgeRq = function (messageArray) {
    let age = 'none'

    if (messageArray.includes('+')) {       
        let plusIdx = messageArray.indexOf('+') 
        let testAge = (plusIdx - 1 >= 0) ? messageArray[plusIdx - 1] : -1

        testAge = parseInt(testAge, 10) // The second argument means base 10

        if (testAge >= 18 && testAge <= 100) { age = testAge }
    }

    return age
}

LfgPost.prototype.findLF = function (messageArray) {
    return LfgPost.prototype.scanRight(messageArray, messageArray.indexOf("lf"), 3, 'lf')
}

LfgPost.prototype.findQueue = function (messageArray) {
    return LfgPost.prototype.scanRight(messageArray, messageArray.indexOf("lf"), 3, 'queue')
}

let matchedIdx = -1
// Array to scan, starting index, starting index + 1, number of times to repeat
LfgPost.prototype.scanRight = function (messageArray, newIdx, reps, searchType) {
    let ignLF = ['a', 'chill', 'good']
    let ignQueue = ['for', 'to', 'play', 'more', 'no', 'build', 'lf1', 'lf2', 'lf3', '1', '2', '3', 'g']
    let ignoredWords = new Map()
    let foundMap = new Map()
    let newWord = (newIdx < messageArray.length ) ? messageArray[newIdx] : '' 

    if (reps == 0) {
        matchedIdx = -1
        return ['none']
    }
    

    switch (searchType) {
        case 'lf':   
            ignoredWords = ignLF
            foundMap = sizeMap
            break
        case 'queue':
            ignoredWords = ignQueue
            foundMap = queueMap
            break
    }

    if (foundMap.has(newWord) && (newIdx != matchedIdx)) {
        switch (searchType) {
            case 'lf':
                matchedIdx = newIdx
                //console.log(`Found ${foundMap.get(newWord)} after ${reps} reps | playersReq`)
                return foundMap.get(newWord)
            case 'queue':
                //console.log(`Found ${newWord} after ${reps} reps | queue`)
                return foundMap.get(newWord)
        }
    
    }

    return LfgPost.prototype.scanRight(messageArray, ++newIdx, (ignoredWords.includes(newWord) ? reps : --reps), searchType)
}

// Format message to make it easier to parse
LfgPost.prototype.format = function (message) {
    // I'll make this more efficient in another pass-through
    // The line below is for removing special characters, but it needs work. Things break when it's uncommented atm
    // message = message.content.toLowerCase().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, ' ');
    
    message = message.toLowerCase()
    message = message.replace('.', '')
    message = message.replace('building', 'build')
    message = message.replace('builds', 'build') // Ignore s' after "build"
    message = message.replace('zero', 'no')
    message = message.replace('zerobuild', 'no build')
    message = message.replace('zb', 'no build')
    message = message.replace(',', '')
    message = message.replace('/', ' ')
    message = message.replace('+', ' +')
    message = message.replace('na east', 'nae')
    message = message.replace('na west', 'naw')
    message = message.replace('europe', 'eu')

    // Returns the message as an array of words
    // "looking for" is replaced with "lf"
    return LfgPost.prototype.convertLF(message.split(' '))
}

// Part of message formatting- // If the message contains "looking for", change to "lf", otherwise do nohing
LfgPost.prototype.convertLF = function (messageArray) {
    if ((messageArray.indexOf("looking") + 1 == messageArray.indexOf("for")) && (messageArray.indexOf("for") > 0)) { // if "for" comes after "looking" ex. "looking for group" (and make sure for isn't the first word)
        messageArray.splice(messageArray.indexOf("for"), 1)  // These two lines change "looking" and "for"
        messageArray[messageArray.indexOf("looking")] = "lf" // into "lf"
        if (debug) console.log("Converted lf string")
    }

    return messageArray // Return array of words in the message 
}

LfgPost.prototype.findGamemode = function (messageArray) {
    let gamemode = 'none'

    if (messageArray.includes("build")) { // If "build is in the message"
        if (messageArray.indexOf("build") - 1 < 0) { return 'none' } // If build is the first word, no keyword - ex. builds na east 21+

        if (messageArray.indexOf("no") == messageArray.indexOf("build") - 1) // Check if it's "no builds"
            gamemode = "zero build"
        else { gamemode = "builds" }
    } else { gamemode = ("none") }

    return gamemode
}

exports.LfgPost = LfgPost
//module.exports = LfgPost
exports.LfgPost.prototype.updateStats = LfgPost.prototype.updateStats