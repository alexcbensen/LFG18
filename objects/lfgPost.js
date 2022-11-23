const Discord = require("discord.js")
let player = require("../objects/player.js")
//import { player } from './modules/player.js'

let prefixStr = '' // Examples: "lfg", "lf1", "lf2", "lf3"
let gamemode = ''
let gapTolerance = 2   // Number of words that will be ignored if they come in between "lf" and a key from sizeMap
let igoredWords = ['a']

// Quantities to replace string with
const sizeMap = new Map([
    ['g', '3'],
    ['group', '3'],
    ['squad', '3'],
    ['three', '3'],
    ['trio', '3'],
    ['few', '3'],
    ['two', '2'],
    ['duo', '2'],
    ['couple', '2'],
    ['one', '1'],
    ['3', '3'],
    ['2', '2'],
    ['1', '1'],
])

// Map of strings to replace number in reply message
const groupStrs = new Map([
    ['1', "a fourth"],
    ['2', "two more people"],
    ['3', "a squad"],
    ['g', "a fourth"],
])

// Object
const lfgPost = {
    author: null,
    message: ''
}

// Constructor
function LfgPost(sender, message) {
    this.author = new player.Player(sender)
    this.message = message

    return this
}

function isValid(message) {
    let valid = false
    let words = format(message)
        
    // Compare character after "lf" to *all* keys in sizeMap - This can be more efficient, rewrite
    for (let [key, value] of sizeMap) {
        /* CASE: Case: If "lf" is in the message, and immediately followed by a key from sizeMap
         * Examples: "lf1", "lf2", "lf3"
         */
        if (words.includes("lf" + key)) {
            console.log("test")
            prefixStr = "lf" + value // Update prefixStr with proper format
            valid = true
            break
            
        /* CASE: If "lf" isn't immediately followed by a validSize
         * Example(s): "lf g", "lf 2"
         * -- Check if the next word is a validSize
        */    
        }

        if (words.includes("lf")) {
            let curIdx = words.indexOf("lf")
            let nextIdx = curIdx + 1
            let wordsChecked = 0
            let curGap = 0
            let nextWord = ""
        
            // Check up to (gapTolerance) words, if they're in the ignored
            while (curGap < gapTolerance) {
                nextWord = words[nextIdx]
        
                // Do nothing if no words follow "lf"
                if(nextIdx >= words.length) { break }
        
                if (igoredWords.includes(nextWord)) {
                    //console.log(`${nextWord} *ignored*`)
                } else {
                    if (nextWord == key) {
                        prefixStr = "lf" + value
                        valid = true
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
    
    if (valid) console.log(`Command with prefix ${prefixStr} was sent`)

    return valid
}

// Format message to make it easier to parse
function format(message) {
    // Messy, but trying to maintain functionality. I'll make this more efficient on the next pass-through
    // message = message.content.toLowerCase().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, ' ');
    
    message = message.content.toLowerCase()
    message = message.replace('builds', 'build') // Ignore s' after "build"
    message = message.replace('zero', 'no')
    message = message.replace('zb', 'no build')
  
    let words = message.split(' ') // Split message into array of words
    words = convertLF(words) // Convert "looking for" to "lf"

    return words // Array of words from message
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

// Need to set gamemode of Player object
function setGamemode(words) {
    let groupChar = prefixStr[2] // Size of group the player is looking for
    let gamemodeStr = ""

    if (words.includes("build")) { // If "build is in the message"
        if (words.indexOf("build") - 1 < 0) { return 'none' } // If build is the first word, no keyword - ex. builds na east 21+

        if (words.indexOf("no") == words.indexOf("build") - 1) // Check if it's "no builds"
            gamemode = "no build" // There's less to do here cause of the word replacement done, above this event trigger
        else { gamemode = "build" } // Add edge cases
    }

    console.log(`${gamemode}`)

    switch (gamemode) {
        case "build":
            gamemodeStr = "builds"
        case "no build":
            gamemodeStr = "zero build"
        default: { }

        client.channels.cache.get(feedChannel).send(`${username}'s looking for ${groupChar} more player(s) to play Fortnite ${gamemodeStr}`)
        console.log(`${username}'s looking for ${groupChar} more player(s) to play Fortnite ${gamemodeStr}`)
        //player.send(`${username}'s looking for ${groupChar} more player(s) to play Fortnite ${gamemodeStr}`)
    }
}

function checkWithoutSpaces(words) {
    
}

function checkWithSpaces(words) {

}


exports.LfgPost = LfgPost
exports.lfgPost = lfgPost
exports.isValid = isValid
exports.setGamemode = setGamemode