const Discord = require("discord.js")

function Item(item) {
    this.name = item.name
    this.description = item.description
    this.type = item.type
    this.rarity = item.rarity
    this.set = item.set
    this.image = item.image
    this.shopHistory = item.shopHistory
}