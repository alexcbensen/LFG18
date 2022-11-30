const Discord = require("discord.js")

const player = {
    name: null,
    region: 'none',
    gamemode: 'none',
    groupSize: 1,
    playersReq: 0,
    queue: 4
}

 // Constructor
function Player(user) {
    // Name-setting in constructor isn't working 
    this.name = user.tag
    
    return player
}

// Getters
function getName() { return this.name }
function getRegion() { return this.region }
function getGamemode() { return this.gamemode }
function getGroupSize() { return this.groupSize }
function getPlayersReq() { return this.playersReq }
function getQueue() { return this.queue }

// Setters
function update(name, region, gamemode, groupSize, playersReq, queue) {
    if (name) this.name = name
    if (region) this.region = region
    if (gamemode) this.gamemode = gamemode
    if (groupSize) this.groupSize = groupSize
    if (playersReq) this.playersReq = playersReq
    if (queue) this.queue = queue
}


exports.Player = Player
exports.update = update
exports.getName = getName
exports.getRegion = getRegion
exports.getGamemode = getGamemode
exports.getGroupSize = getGroupSize
exports.getPlayersReq = getPlayersReq
exports.getQueue = getQueue
exports.player = player