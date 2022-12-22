

const Canvas = require("canvas")
const { DiscordAPIError } = require("discord.js")
const Discord = require("discord.js")
const background = "https://i.imgur.com/zcFJcNA.png"

const dim = {
    height: 675,
    width: 1200,
    margin: 50
}

const av = {
    size: 256,
    x: 480,
    y: 170
}

const generateImage = async (member) => {
    let username = member.username // Username (obviously)
    let avatarURL = member.user.displayAvatarURL({extension: "png", dynamic: false, size: av.size}) // Profile Picture

    const canvas = Canvas.createCanvas(dim.width, dim.height)
    const ctx = canvas.getContext("2d")

    // Draw background
    const backimg = await Canvas.loadImage(background)
    ctx.drawImage(backimg, 0, 0)

    // Draw black tinted box
    ctx.fillStyle = "rgba(0, 0, 0, 0.8"
    ctx.fillRect(dim.margin, dim.margin, dim.width - 2 * dim.margin, dim.height - 2 * dim.margin)

    const avimg = await Canvas.loadImage(avatarURL)
    ctx.save()
    
    ctx.beginPath()
    ctx.arc(av.x + av.size /2, av.y + av.size / 2, av.size / 2, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(avimg, av.x, av.y)
    ctx.restore()

    const attachment = new Discord.Attachment(canvas.toBuffer(), "welcome.png")
    return attachment
}

module.exports = generateImage