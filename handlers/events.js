const { getFiles } = require("../util/functions")
const main = require("../index.js")

module.exports = (bot, reload) => {
    const {client} = bot
    
    let events = getFiles("./events/", ".js")

    if(events.length === 0) {
        console.log("No events to load")
        
    }

    events.forEach((f, i) => {
        if (reload) {
            delete require.cache[require.resolve(`../events/${f}`)]
        }

        const event = require(`../events/${f}`)
        client.events.set(event.name, event)

        //console.log(`${event.name}\t  added`)

        if (!reload) {
            //console.log(`${f}  loaded`)
        }
    })

    if (!reload)
        initEvents(bot)
}

// ...args means the last parameter will be an array of the next typed values
function triggerEventHandler(bot, event, ...args) {
    const {client} = bot
    // You fucking suck
    try {
        if (client.events.has(event))
            client.events.get(event).run(bot, ...args)
        else
            throw new Error(`Event ${event} doesn't exist`)
    }
    catch(err) {
        console.error(err)
    }
}

function initEvents(bot) {
    const {client} = bot
    
    client.on("ready", () => {
        triggerEventHandler(bot, "ready")
    })

    client.on("messageCreate", (message) => {
        triggerEventHandler(bot, "messageCreate", message)
    })
}