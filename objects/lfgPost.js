const { Discord, EmbedBuilder } = require("discord.js")
let player = require("../objects/player.js")
//const { request } = require('undici');

let gapTolerance = 3   // Number of words that will be ignored if they come in between "lf" and a key from sizeMap
let ignoredLF = ['a', 'chill']  // LF = looking for
let ignoredGS = ['for', 'to', 'play', 'more']   // fs = group size
let feedChannel = "1041577629293224056"

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
])

// If the key is in the message, queue will be set to the value
// 4 is squads, 3 is trios, and 2 is duos
const queueMap = new Map([
    ['squads', 4],
    ['trios', 3],
    ['duos', 2]
])

// Map for message output
const queueStrs = new Map([
    [4, "Squads"],
    [3, "Trios"],
    [2, "Duos"],
])

const strReplacements = new Map([
    ['builds', 'Battle Royale - Builds'],
    ['zero build', 'Zero Build - Battle Royale'],
    [1, '**1** more player'],
    [2, '**2** more players'],
    [3, '**3** players']
])

// Object
const lfgPost = {
    author: null,
    content: '',
}

// Constructor
function LfgPost(user, message) {
    this.author = new player.Player(user)
    this.content = message
 
    return lfgPost
}

//const playerDat = await request('https://api.fortnitetracker.com/v1/profile/{platform}/Vexedly');
//const { file } = await catResult.body.json();

function create(bot, message) {
    const {client, prefix, owners} = bot
    
    let member = message.member
    let author = message.author
    let content = message.content    
    let command = false
    command = isCommand(bot, content)
   
    if (command) {
        console.log(`Player: ${getName()}`)

        if (getPlayersReq() != 0) { console.log(`Needs: ${getPlayersReq()} players`) } else { console.log(``) }
        if (getGamemode() != 'none') { console.log(`Gamemode: ${getGamemode()}`) } else { console.log(``) }
        if (getQueue() != 'none') { console.log(`Queue: ${queueStrs.get(getQueue())}`) } else { console.log(``) }
        
        console.log("\n\n\n")
        //if (getGroupSize() != 1) { console.log(`Queue: ${getGroupSize()}`) } else { console.log(``) }
        
        
        // Create lfgPost object
        let user = client.users.cache.get(message.member.id)
    
        let post = new LfgPost(message.member, content)
        
        sendMessage(client, message.member, feedChannel, content)
    
        delete post

        return this
    }
}

function isCommand(user, message) {
    let command = false
    let words = format(message)
    //console.log(words)
    let foundIdx = -1
    
    updateGamemode(words)

    // Compare character after "lf" to *all* keys in sizeMap - This can be more efficient, rewrite
    for (let [key, value] of sizeMap) {
         // Examples: "lf1", "lf2", "lf3"
        if (words.includes("lf" + key)) {
            foundIdx = words.indexOf("lf" + key)
            setPlayersReq(value)
            command = true
            break
        }
    }

    if (command == false) {
        const [found, idx] = findLF(words)
        foundIdx = idx
        //console.log(`lf: ${idx}`)
        command = found
        //console.log(`Command = ${found}`)
    }

    if (command) { 
        setName(user.tag)
        setContent(message)

        findQueue(foundIdx, words) 
        findAgeRq(words)
        //setPlayersReq()
        
        if (getQueue() == 'none') { setQueue(4) }
        if (getPlayersReq() >= getQueue()) { setPlayersReq(getQueue() - 1) } // Ex. lf3 duos 
    }

    return command
}

function sendMessage(client, member, channelID, content) {
    let avatarURL = member.user.displayAvatarURL({extension: "png", dynamic: false, size: 256}) // Profile Picture 
    let gamemode = (getGamemode() == 'none') ? 'Fortnite' : strReplacements.get(getGamemode())
    let playersReq = strReplacements.get(getPlayersReq())
    let queue = queueStrs.get(getQueue())
    let name = member.displayName
    //const mentionedUser = userMention(member.id);


    const embed = new EmbedBuilder()
        .setColor(0x2f3136) // Refers to the line to the left of an embedded message
        .setTitle(`${gamemode}`)
        //.setURL('https://www.youtube.com/watch?v=eBGIQ7ZuuiU') // Rick roll
        //.setAuthor({ name: `header`, iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://www.youtube.com/watch?v=eBGIQ7ZuuiU' }) // Rick roll
        //.setDescription(`Looking for ${getPlayersReq()} | ${queue}`)
        .setThumbnail(avatarURL)
        //.addFields({ name: 'Battle Royale', value: `${gamemode}`, inline: true })
        .addFields({ name: `${queue}`, value: `Looking for ${playersReq}`})
        //.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
        
        //.addFields({ name: 'Inline field title', value: 'Some value here'})
        //.addFields({ name: 'test', value: `${content}`}) // Display origonal message
        //.setImage(avatarURL)
        .setTimestamp()
        .setFooter({ text: `Posted by ${name}`});

    client.channels.cache.get(channelID).send({embeds: [embed]})
}

function findAgeRq(words){

}

function findLF(words) {
    return searchOverGap()
}

function findLF(words) {
    return searchOverGap(words.indexOf("lf"), words, 3, ignoredLF, sizeMap, 'lf')
}

function findQueue(wordsIdx, words) {
    return searchOverGap(wordsIdx, words, 4, ignoredGS, queueMap, 'queue')
}

function searchOverGap(wordIdx, words, tolerance, ignored, map, searchType) {
    let found = false
    let foundIdx = -1

    if (searchType == 'queue') {
        //console.log(wordIdx)
    }

    if (searchType == 'lf' && words.indexOf("lf") == -1) return [found, foundIdx]

    for (let [key, value] of map) {
        
        let curGap = 0
        let curIdx = wordIdx
        let nextIdx = curIdx + 1
        let nextWord = ''
        foundIdx = -1
        
        while (curGap < tolerance) {
            nextWord = words[nextIdx]
            if(nextIdx >= words.length) {
                //console.log("Not found")
                break
            } // next word is the last word
    

            if (!ignored.includes(nextWord)) {
                //console.log(nextWord)
                if (nextWord == key) {
                    found = true
                    foundIdx = nextIdx

                    if (searchType == 'lf')    setPlayersReq(value)
                    if (searchType == 'queue') setQueue(value)
                    
                    return [found, foundIdx]
                } else {
                    //if ( !map.has(nextWord) ) return [found, foundIdx]

                    nextWord = words[nextIdx + curGap]
                }
            }

            curGap++
            nextIdx++
        }

        if (searchType == 'queue') {
            // No queue was found
            setQueue('none')
        }
    }

    return [found, foundIdx]
}

// Getters and setters for lfgPost
function setContent(content) { this.content = content }
function getContent() { return this.content }

// Setters for player
function             setName(user) { player.update(user, null, null, null, null, null) }
function         setRegion(region) { player.update(null, region, null, null, null, null) }
function     setGamemode(gamemode) { player.update(null, null, gamemode, null, null, null) }
function   setGroupSize(groupSize) { player.update(null, null, null, groupSize, null, null) }
function setPlayersReq(playersReq) { player.update(null, null, null, null, playersReq, null) }
function           setQueue(queue) { player.update(null, null, null, null, null, queue) }

// Getters for player
function             getName(user) { return player.getName() }
function         getRegion(region) { return player.getRegion() }
function     getGamemode(gamemode) { return player.getGamemode() }
function   getGroupSize(groupSize) { return player.getGroupSize() }
function getPlayersReq(playersReq) { return player.getPlayersReq() }
function           getQueue(queue) { return player.getQueue() }

/* Here's those lines before formatting
function setRegion(region) { player.update(region, null, null) }
function setGamemode(gamemode) { player.update(null, gamemode, null) }
function setQueue(queue) { player.update(null, null, queue) }

function getRegion(region) { return player.getRegion() }
function getGamemode(gamemode) { return player.getGamemode() }
function getQueue(queue) { return player.getQueue() }
*/

// One day, someone's gonna read how I formatted those functions. I'm sorry

// Format message to make it easier to parse
function format(message) {
    // I'll make this more efficient in another pass-through
    // The line below is for removing special characters, but it needs work. Things break when it's uncommented atm
    // message = message.content.toLowerCase().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, ' ');
    
    message = message.toLowerCase()
    message = message.replace('building', 'build')
    message = message.replace('builds', 'build') // Ignore s' after "build"
    message = message.replace('zero', 'no')
    message = message.replace('zb', 'no build')
  
    // Returns the message as an array of words
    // "looking for" is replaced with "lf"
    return convertLF(message.split(' '))
}

// Part of message formatting- // If the message contains "looking for", change to "lf", otherwise do nohing
function convertLF(words) {
    if ((words.indexOf("looking") + 1 == words.indexOf("for")) && (words.indexOf("for") > 0)) { // if "for" comes after "looking" ex. "looking for group" (and make sure for isn't the first word)
        words.splice(words.indexOf("for"), 1)  // These two lines change "looking" and "for"
        words[words.indexOf("looking")] = "lf" // into "lf"
        // console.log("Converted lf string")
    }

    return words // Return array of words in the message 
}

function updateGamemode(words) {
    if (words.includes("build")) { // If "build is in the message"
        if (words.indexOf("build") - 1 < 0) { return 'none' } // If build is the first word, no keyword - ex. builds na east 21+

        if (words.indexOf("no") == words.indexOf("build") - 1) // Check if it's "no builds"
            setGamemode("zero build")
        else { setGamemode("builds") }

        return
    } else { setGamemode("none") }

    //client.channels.cache.get(feedChannel).send(`${username}'s looking for ${getPlayersReq()} to play Fortnite ${getGamemode()}`)
    //console.log(`${username}'s looking for ${getQueue()} to play Fortnite ${getGamemode()}`)
    //player.send(`${username}'s looking for ${getQueue()} more player(s) to play Fortnite ${getQueue()}`)
}

exports.LfgPost = LfgPost
exports.lfgPost = lfgPost
exports.create = create

// Setter/getter exports for player
exports.setRegion = setRegion
exports.setGamemode = setGamemode
exports.setQueue = setQueue

exports.getContent = getContent
exports.getName = getName
exports.getRegion = getRegion
exports.getQueue = getQueue
exports.getGamemode = getGamemode
exports.getPlayersReq = getPlayersReq