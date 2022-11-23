const Discord = require("discord.js")

const player = {
    user: null,
    region:  'none',
    gamemode: 'none',
    queue: 'none'
}

 // Constructor
function Player(user) {
    this.user = user
    return this
}

// Functions
function inQueue() {
    return true
}

function update(region, gamemode, queue) {
    this.region = region,
    this.gamemode = gamemode,
    this.queue = queue
}

exports.Player = Player
exports.inQueue = inQueue
exports.update = update
exports.player = player