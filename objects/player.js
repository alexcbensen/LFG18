const Discord = require("discord.js")

const player = {
    name: null,
    region: 'none',
    gamemode: 'none',
    queue: 'none'
}

 // Constructor
function Player(member) {
    player.name = member.username
    
    return player
}

// Getters
function getName() { return this.name }
function getRegion() { return this.region }
function getGamemode() { return this.gamemode }
function getQueue() { return this.queue }

// Setters
function update(name, region, gamemode, queue) {
    if (name) this.user = user
    if (region) this.region = region
    if (gamemode) this.gamemode = gamemode
    if (queue) this.queue = queue
}


exports.Player = Player
exports.update = update
exports.getName = getName
exports.getRegion = getRegion
exports.getGamemode = getGamemode
exports.getQueue = getQueue
exports.player = player