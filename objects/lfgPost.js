const { Discord, EmbedBuilder } = require("discord.js")
// const { SIZE_MAP, SEARCH_TYPES } = require('consts.js')

let player = require("../objects/player.js")
let feedChannel = '1041577629293224056'
let commandChannel = '1022422781494841354'

const debug = true
// Quantities to replace size string with
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
    [1, 'Looking for **1** more player'],
    [2, 'Looking for **2** more players'],
    [3, 'Looking for **3** players'],
    ['builds',     'Battle Royale - Builds'],
    ['zero build', 'Zero Build - Battle Royale'],
])
function LfgPost(client, user, message) {
    let newPlayer = new player.Player(user)
    
    this.message = message
    
    let [ command, messageArray , playersReq] = LfgPost.prototype.findPlayersReq(message)

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
        this.content = messageArray
        this.minAge = -1
        
        LfgPost.prototype.sendMessage(client, commandChannel, message, this)
        return this
    }

    return null
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

LfgPost.prototype.sendMessage = function (client, channelID, content, post) {
    let channel = client.channels.cache.get(channelID)

    //const mentionedUser = userMention(member.id);

    const party = {
        playerName: post.OP.name,
        size: (post.OP.queue - post.OP.playersReq),
        capacity: post.OP.queue,
        playersReq: post.OP.playersReq,
        gamemode: (post.OP.gamemode == 'none') ? 'Fortnite' : strReplacements.get(post.OP.gamemode),
        players: strReplacements.get(post.OP.playersReq),
        queue: queueStrs.get(post.OP.queue),
        avatarURL: post.OP.avatarURL,
        lfString: ' '
    }

    if (party.size == 1) {
        switch (party.capacity) {
            case 2: ( party.lfString = 'Looking for a partner' )
            case 3: ( party.lfString = 'Looking for a group' )
            case 4: ( party.lfString = 'Looking for a group' )
            default: break
        }
    } else { party.lfString = strReplacements.get(party.playersReq) }
    
    LfgPost.prototype.sendEmbed(channel, party)
}

LfgPost.prototype.sendEmbed = function (channel, party) {
    const embed = new EmbedBuilder()
    .setColor(0x2f3136) // Refers to the line to the left of an embedded message
    .setTitle(`${party.gamemode}`)
    //.setURL('https://www.youtube.com/watch?v=eBGIQ7ZuuiU') // Rick roll
    //.setAuthor({ name: `header`, iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://www.youtube.com/watch?v=eBGIQ7ZuuiU' }) // Rick roll
    //.setDescription(`Desription`)
    .setThumbnail(party.avatarURL)
    //.addFields({ name: 'Battle Royale', value: `${gamemode}`, inline: true })
    .addFields({ name: `${party.queue}`, value: `${party.lfString}`})
    //.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
    
    //.addFields({ name: 'Inline field title', value: 'Some value here'})
    //.addFields({ name: 'test', value: `${content}`}) // Display origonal message
    .setTimestamp()
    .setFooter({ text: `${party.playerName}`, iconURL: 'https://i.imgur.com/pi35BxM.png' });

    channel.send({embeds: [embed]})
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
        //console.log(`No ${searchType} found`)
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
    } else { setGamemode("none") }

    return gamemode
}

exports.LfgPost = LfgPost