const Discord = require("discord.js")
let player = require("../objects/player.js")

let gapTolerance = 3   // Number of words that will be ignored if they come in between "lf" and a key from sizeMap
let ignoredLF = ['a', 'chill']  // LF = looking for
let ignoredGS = ['for', 'to', 'play', 'more']   // fs = group size

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
    [1, "1 more person"],
    [2, "2 more people"],
    [3, "3 more people"],
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
    
    setName(user.tag)

    return this
}

function create(message) {
    if (isCommand(message)) {
       
        console.log(`Player: ${getName()}`)
        if (getQueue() != 'none') { console.log(`Queue: ${getQueue()}`) } else { console.log(``) }
        if (getPlayersReq() != 0) { console.log(`Looking for ${getPlayersReq()}`) } else { console.log(``) }
        if (getGamemode() != 'none') { console.log(`Gamemode: ${getGamemode()}`) } else { console.log(``) }

        console.log("\n\n\n")
        //if (getGroupSize() != 1) { console.log(`Queue: ${getGroupSize()}`) } else { console.log(``) }
    }
}

function isCommand(message) {
    let command = false
    let words = format(message)
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
        findQueue(foundIdx, words) 
        findAgeRq(words)
        //setPlayersReq()
        
        if (getPlayersReq() >= getQueue()) {
            setPlayersReq(getQueue() - 1) // Ex. lf3 duos
        }

        if (getQueue() == 'none') setQueue(4)
    }

    return command
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

// Getters for lfgPost
function getMessage() { return lfgPost.content }

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
        else { setGamemode("builds") } // Add edge cases

        return
    }

    setGamemode('none')

    //client.channels.cache.get(feedChannel).send(`${username}'s looking for ${getPlayersReq()} to play Fortnite ${getGamemode()}`)
    //console.log(`${username}'s looking for ${getQueue()} to play Fortnite ${getGamemode()}`)
    //player.send(`${username}'s looking for ${getQueue()} more player(s) to play Fortnite ${getQueue()}`)
}

exports.LfgPost = LfgPost
exports.lfgPost = lfgPost
exports.create = create
exports.getMessage = getMessage

// Setter/getter exports for player
exports.setRegion = setRegion
exports.setGamemode = setGamemode
exports.setQueue = setQueue
exports.getRegion = getRegion
exports.getGamemode = getGamemode
exports.getQueue = getQueue