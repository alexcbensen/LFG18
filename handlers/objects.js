const fs = require("fs")
const main = require("../index.js")

const getFiles = (path, ending) => {
    return fs.readdirSync(path).filter(f => f.endsWith(ending))
}

module.exports = (bot, reload) => {
    const { client } = bot
    
    let objects = getFiles("./objects/", ".js")

    if (objects.length === 0)
        console.log("objects.js contains no objects")

    objects.forEach(f => {
        if (reload) delete require.cache[require.resolve(`../objects/${f}`)]
        
        const object = require(`../objects/${f}`)
        client.objects.set(object.name, object)

        console.log(`Objects: ${object.name} loaded`)
    })
}