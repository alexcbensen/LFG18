const Discord = require("discord.js")

function Item(ITEM, TYPE) {
    this.name = ITEM.name
    this.rarity = ITEM.rarity.value
    this.chapter = ITEM.introduction.chapter
    this.season = ITEM.introduction.season
    this.icon = ITEM.images.icon
    this.history = ITEM.shopHistory
    this.type = TYPE
    
    return this
}

exports.Item = Item