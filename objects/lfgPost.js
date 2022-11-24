const Discord = require("discord.js")
let player = require("../objects/player.js")

let gapTolerance = 2   // Number of words that will be ignored if they come in between "lf" and a key from sizeMap
let igoredWords = ['a']

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
function LfgPost(member, message) {
    lfgPost.author = new player.Player(member)
    lfgPost.content = message

    return lfgPost
}

function create(message) {
    if (isCommand(message)) {
        console.log(`${getName()} needs ${queueStrs.get(getQueue())}`)
    }
}

function isCommand(message) {
    let command = false
    let words = format(message)
        
    // Compare character after "lf" to *all* keys in sizeMap - This can be more efficient, rewrite
    for (let [key, value] of sizeMap) {
         // Examples: "lf1", "lf2", "lf3"
        if (words.includes("lf" + key)) {
            setQueue(value)
            command = true
            break
        }

        // Examples: "lf 1", "lf two", "looking for a group"
        if (words.includes("lf")) {
            let curGap = 0
            let curIdx = words.indexOf("lf")
            let nextIdx = curIdx + 1
            let nextWord = ''
        
            while (curGap < gapTolerance) { // Check up to (gapTolerance) words, if they're in the ignored
                nextWord = words[nextIdx]
        
                if(nextIdx >= words.length) { break } // 'lf' is the last word
        
                if (!igoredWords.includes(nextWord)) {
                    if (nextWord == key) {
                        setQueue(value)
                        command = true
                        break
                    } else {
                        nextWord = words[nextIdx + curGap]
                    }
                }
        
                curGap++
                nextIdx++
            }
        }
    }

    return command
}

// Getters for lfgPost
function getMessage() { return lfgPost.content }

// Setters for player
function       setPlayer(user) { player.update(user, null, null, null) }
function     setRegion(region) { player.update(null, region, null, null) }
function setGamemode(gamemode) { player.update(null, null, gamemode, null) }
function       setQueue(queue) { player.update(null, null, null, queue) }

// Getters for player
function         getName(user) { return player.getName() }
function     getRegion(region) { return player.getRegion() }
function getGamemode(gamemode) { return player.getGamemode() }
function       getQueue(queue) { return player.getQueue() }

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
    }

    client.channels.cache.get(feedChannel).send(`${username}'s looking for ${getQueue()} to play Fortnite ${getGamemode()}`)
    console.log(`${username}'s looking for ${getQueue()} to play Fortnite ${getGamemode()}`)
    //player.send(`${username}'s looking for ${getQueue()} more player(s) to play Fortnite ${getQueue()}`)
}

function checkWithoutSpaces(words) {
    
}

function checkWithSpaces(words) {

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