/*
Player.prototype.log = function() {
    console.log(`${this.name} ${this.tag} etc...`);
}

// In a different file ====================
let user = Discord.getUser();
let player = new Player(user);
player.log()
*/
const Discord = require("discord.js")

 // Constructor
function Player(user) {
    this.name = user.username
    this.tag = user.discriminator
    this.avatarURL = user.displayAvatarURL({extension: "png", dynamic: false, size: 256})
    this.region = []
    this.gamemode = ''
    this.groupSize = 0
    this.playersReq = 0
    this.queue = 0

    this.STATS = [{
        USERNAME: '',
        LEVEL: 0,
        KILLS: 0,
        WIN_RATE:  0,
        KD_RATIO:  0,
        SOLO_WINS: 0,
        LAST_MODIFIED:  0,
        MATCHES_PLAYED: 0,
    }]

    return this
}

// Player.prototype.update = function() {}

exports.Player = Player
