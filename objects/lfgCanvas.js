const Discord = require("discord.js")

const lfgCanvas = {
    x: 0,
    y: 0
}

function LfgCanvas() {
    return lfgCanvas
}

async function create() {
    const canvas = Canvas.createCanvas(700, 250);
    const context = canvas.getContext('2d');
    const background = await Canvas.loadImage('../graphics/wallpaper.jpg');

    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'profile-image.png' });

    return attachment
}

exports.lfgCanvas = lfgCanvas
exports.LfgCanvas = LfgCanvas
exports.create = create
