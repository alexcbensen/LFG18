const { Discord, EmbedBuilder } = require("discord.js")
let player = require("../objects/player.js")
let feedChannel = "1022422781494841354"

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

// Object
const lfgPost = {
    author: null,
    content: '',
    minAge: -1,
}

// Constructor
function LfgPost(user, message) {
    this.author = new player.Player(user)
    this.content = message
    this.minAge = -1

 
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
        //console.log(`Player: ${getName()}`)

        //if (getPlayersReq() != 0) { console.log(`Needs: ${getPlayersReq()} players`) } else { console.log(``) }
        //if (getGamemode() != 'none') { console.log(`Gamemode: ${getGamemode()}`) } else { console.log(``) }
        //if (getQueue() != 'none') { console.log(`Queue: ${queueStrs.get(getQueue())}`) } else { console.log(``) }
        
        //console.log("\n\n\n")
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
    let messageArray = format(message)
    //console.log(messageArray)
    let foundIdx = -1
    
    updateGamemode(messageArray)

    // Compare character after "lf" to *all* keys in sizeMap - This can be more efficient, rewrite
    for (let [key, value] of sizeMap) {
         // Examples: "lf1", "lf2", "lf3"
        if (messageArray.includes("lf" + key)) {
            foundIdx = messageArray.indexOf("lf" + key)
            setPlayersReq(value)
            command = true
            break
        }
    }

    if (command == false) {
        const [found, idx] = findLF(messageArray)
        foundIdx = idx
        //console.log(`lf: ${idx}`)
        command = found
        //console.log(`Command = ${found}`)
    }

    if (command) { 
        setName(user.tag)
        setContent(message)

        findQueue(foundIdx, messageArray) 
        findAgeRq(messageArray)
        findRegion(messageArray)
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
    let lfString = getPlayersReq()
    let playersNeeded = getPlayersReq()
    let partyCapacity = getQueue()
    let partySize = ( partyCapacity - playersNeeded ) 

    // console.log(`Party Capacity: ${partyCapacity} \nParty Size: ${partySize} \nPlayers Needed: ${playersNeeded} \n`)

    // Post: "lf1 trios zero build"
    // log says party size is 2. Why does it run to "test2"?
    if (partySize == 1) {
        switch (partyCapacity) {
            case 2: ( lfString = 'Looking for a partner' )
            case 3: ( lfString = 'Looking for a group' )
            case 4: ( lfString = 'Looking for a group' )
            default: break
        }
    } else { lfString = strReplacements.get(playersNeeded) }


    const embed = new EmbedBuilder()
        .setColor(0x2f3136) // Refers to the line to the left of an embedded message
        .setTitle(`${gamemode}`)
        //.setURL('https://www.youtube.com/watch?v=eBGIQ7ZuuiU') // Rick roll
        //.setAuthor({ name: `header`, iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://www.youtube.com/watch?v=eBGIQ7ZuuiU' }) // Rick roll
        //.setDescription(`Looking for ${getPlayersReq()} | ${queue}`)
        .setThumbnail('https://i.imgur.com/X4Gl1DQ.png')
        //.addFields({ name: 'Battle Royale', value: `${gamemode}`, inline: true })
        .addFields({ name: `${queue}`, value: `${lfString}`})
        //.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
        
        //.addFields({ name: 'Inline field title', value: 'Some value here'})
        //.addFields({ name: 'test', value: `${content}`}) // Display origonal message
        .setTimestamp()
        .setFooter({ text: `${name}`, iconURL: avatarURL });

    client.channels.cache.get(channelID).send({embeds: [embed]})
}

function findRegion(messageArray) {
    if (messageArray.includes('naw')) {
        setRegion('naw')
        //console.log('naw')
    }

    if (messageArray.includes('nae')) {
        setRegion('nae')
        //console.log('nae')
    }
}

function findAgeRq(messageArray) {
    if (messageArray.includes('+')) {
           
        let plusIdx = messageArray.indexOf('+')
        let age = (plusIdx - 1 >= 0) ? messageArray[plusIdx - 1] : -1
        age = parseInt(age, 10) // The second argument means base 10
        
        if (age >= 18 && age <= 100) {
            //console.log("valid age found")
            setMinAge(age)
            return
        }

        setMinAge('')
    }
}

function findLF(messageArray) {
    return scanRight(messageArray, messageArray.indexOf("lf"), 3, 'lf')
}


function findQueue(fromIdx, messageArray) {
    return scanRight(messageArray, fromIdx, 3, 'queue')
}

let matchedIdx = -1
// Array to scan, starting index, starting index + 1, number of times to repeat
function scanRight(messageArray, newIdx, reps, searchType) {
    let ignLF = ['a', 'chill', 'good']
    let ignQueue = ['for', 'to', 'play', 'more', 'no', 'build', 'lf1', 'lf2', 'lf3', '1', '2', '3', 'g']
    let ignoredWords = new Map()
    let foundMap = new Map()

    let newWord = (newIdx < messageArray.length ) ? messageArray[newIdx] : '' 
    

    if (reps == 0) {
        matchedIdx = -1
        return [false, -1]
    }

    switch (searchType) {
        case 'lf':   
            ignoredWords = ignLF
            foundMap = sizeMap
            break
        case 'queue':
            setQueue('none')
            ignoredWords = ignQueue
            foundMap = queueMap
            break
    }
    

    if (foundMap.has(newWord) && (newIdx != matchedIdx)) {
        switch (searchType) {
            case 'lf':
                //console.log(`Looking for ${newWord}`)
                matchedIdx = newIdx
                setPlayersReq(foundMap.get(newWord))
                break
            case 'queue':
                //console.log(`Playing ${newWord}`)
                setQueue(foundMap.get(newWord))
                break
        }
        
        return [true, newIdx]
    }

    //console.log(`${searchType}`) 
    return scanRight(messageArray, ++newIdx, (ignoredWords.includes(newWord) ? reps : --reps), searchType)
}

function setMinAge(age) { this.minAge = age }
function getMinAge() { return this.minAge }

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
    message = message.replace('zerobuild', 'no build')
    message = message.replace('zb', 'no build')
    message = message.replace(',', '')
    message = message.replace('/', ' ')
    message = message.replace('+', ' +')
    message = message.replace('na east', 'nae')
    message = message.replace('na west', 'naw')

    // Returns the message as an array of words
    // "looking for" is replaced with "lf"
    return convertLF(message.split(' '))
}

// Part of message formatting- // If the message contains "looking for", change to "lf", otherwise do nohing
function convertLF(messageArray) {
    if ((messageArray.indexOf("looking") + 1 == messageArray.indexOf("for")) && (messageArray.indexOf("for") > 0)) { // if "for" comes after "looking" ex. "looking for group" (and make sure for isn't the first word)
        messageArray.splice(messageArray.indexOf("for"), 1)  // These two lines change "looking" and "for"
        messageArray[messageArray.indexOf("looking")] = "lf" // into "lf"
        // console.log("Converted lf string")
    }

    return messageArray // Return array of words in the message 
}

function updateGamemode(messageArray) {
    if (messageArray.includes("build")) { // If "build is in the message"
        if (messageArray.indexOf("build") - 1 < 0) { return 'none' } // If build is the first word, no keyword - ex. builds na east 21+

        if (messageArray.indexOf("no") == messageArray.indexOf("build") - 1) // Check if it's "no builds"
            setGamemode("zero build")
        else { setGamemode("builds") }

        return
    } else { 
        setGamemode("none")
    }

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