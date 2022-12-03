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
    

    return this
}

// Player.prototype.update = function() {}

exports.Player = Player
