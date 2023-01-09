const { Discord, EmbedBuilder, WebhookClient, StageInstancePrivacyLevel } = require("discord.js")
const { Item } = require('./item.js')

function ItemShop() { }

ItemShop.prototype.getDaily = function (client) {
    ItemShop.prototype.get(client, 'Daily')
    //ItemShop.prototype.get(client, 'Featured')
}

ItemShop.prototype.get = function (client, category) {
    const userRequestURL = 'https://fortnite-api.com/v2/shop/br/combined'
    const ApiKey = process.env.FORTNITE_API_KEY
    const CHANNELS = new Map([
        ['Backbling', client.channels.cache.get('1056624915874316368')],
        ['Emote', client.channels.cache.get('1056624836908159016')],
        ['Glider', client.channels.cache.get('1056624773305733210')],
        ['Pickaxe', client.channels.cache.get('1056624251651772467')],
        ['Wrap', client.channels.cache.get('1056625695654162442')],
        ['Skin', client.channels.cache.get('1056627066633724014')],
        ['Trail', client.channels.cache.get('1056625876516753469')],
        ['Character', client.channels.cache.get('1057066135515824169')],
    ])

    fetch( userRequestURL, { headers: { Authorization: ApiKey }} )
    .then( response => { return response.json().then( data => {
        let shopData = null

        const itemTypes = [
            'Backbling', 'Character', 'Emote',
            'Glider', 'Pickaxe', 'Skin', 'Trail', 'Wrap'
        ]

        /* Instantiate Maps for Embed and Item Arrays */
        let embedArrays = new Map()
        itemTypes.forEach((type) => {embedArrays.set( type, [ ] )})
        let itemArrays = embedArrays
    
        switch (category) {
            case ('Daily'):
                shopData = data.data.daily
                break
            case ('Featured'):
                shopData = data.data.featured
                break
            default:
                return
        }

        let count = 0

        shopData.entries.forEach(entry => {
            const itemsInEntry = entry.items.length
            const PRICE = entry.regularPrice
            const BUNDLE = ( (itemsInEntry > 1) ? true : false )

            entry.items.forEach(itemObj => {
                const ID = String(itemObj.id)
                let type = null
    
                if (ID.slice(0, 7) == 'Pickaxe') {
                    type = 'Pickaxe'
                } else if ((ID.slice(0, 3) == 'BID') || ID.slice(0, 8) == 'Backpack') {
                    type = 'Backbling'
                } else if (ID.slice(0, 3) == 'EID') {
                    type = 'Emote'
                } else if (ID.slice(0, 4) == 'Wrap') { 
                    type = 'Wrap'
                } else if (ID.slice(0, 6) == 'Glider') {
                    type = 'Glider'
                } else if (ID.slice(0, 3) == 'CID') {
                    type = 'Skin'
                } else if (ID.slice(0, 9) == 'Character') {
                    type = 'Character'
                } else if (ID.slice(0, 6) == 'Trails') {
                    type = 'Trails'
                } else {
                    //console.log(ID)
                }
                
                //const noTest = ['Pickaxe', 'Glider', 'Wrap', 'Emote', 'Backbling', 'Skin', 'Character']
                //if (!noTest.includes(type)) console.log(`${type}: ${ID}, Image: ${itemObj.images.icon}`)

                const ITEM = new Item(itemObj, type)

                if (ITEM.chapter == 1) {
                    //console.log(`\n\nA${ITEM.NAME} Introduced in Chapter ${ITEM.CHAPTER} Season ${ITEM.SEASON}`)
                }

                const TIMES_IN_SHOP = ITEM.history.length // Number of times in shop
                let firstAvailable = ITEM.history[0]

                firstAvailable = firstAvailable.slice(0, firstAvailable.length - 10).split('-')

                let lastAvailable = ITEM.history[ITEM.history.length - 2]

                if (TIMES_IN_SHOP == 1) { lastAvailable = firstAvailable } else {
                    lastAvailable = ITEM.history[ITEM.history.length - 2]
                    lastAvailable = lastAvailable.slice(0, lastAvailable.length - 10).split('-')
                }

                //console.log(`First Available: ${firstAvailable}\nLast Available ${lastAvailable}`)

                const monthStr = new Map([
                    ['01', 'January'],
                    ['02', 'February'],
                    ['03', 'March'],
                    ['04', 'April'],
                    ['05', 'May'],
                    ['06', 'June'],
                    ['07', 'July'],
                    ['08', 'August'],
                    ['09', 'September'],
                    ['10', 'October'],
                    ['11', 'November'],
                    ['12', 'December'],

                ])

                const DATE_FIRST = {
                    DAY:   firstAvailable[2],
                    MONTH: firstAvailable[1],
                    YEAR:  firstAvailable[0],
                }

                const DATE_LAST = {
                    DAY:   lastAvailable[2],
                    MONTH: lastAvailable[1],
                    YEAR:  lastAvailable[0],
                }

                const embed = new EmbedBuilder()
                .setColor(0x2f3136) // Refers to the line to the left of an embedded message
                .setTitle(`**${ITEM.name}**`)
                //.setThumbnail(item.images.icon)
                .setThumbnail(itemObj.images.icon)
                //.addFields({ name: `${item.name}`, value: `${item.description}`})
                .addFields({ name: `*${ITEM.type}*` , value:
                `**First Appearence**\n` +
                `• Chapter ${ITEM.chapter} Season ${ITEM.season}\n` +
                //`• Rarity:• ${ITEM.RARITY}`
                `**Price**\n` +
                `• ${PRICE} Vbux\n` +
                ((BUNDLE) ? '• Part of a bundle :(\n' : '\n')
                })
                
                // \nReleased: ${monthStr.get(DATE_FIRST.MONTH)} ${DATE_FIRST.DAY}, ${DATE_FIRST.YEAR}
                //.setFooter({ text: ` `, iconURL: 'https://i.imgur.com/pi35BxM.png' });
                //.setFooter({ text: `${PRICE} vbux`, iconURL: 'https://static.wikia.nocookie.net/fortnite/images/e/eb/V-Bucks_-_Icon_-_Fortnite.png' });
                
                // https://i.imgur.com/h9jaSKC.png // LFG Bot
                // https://i.imgur.com/HgragK2.png // Chistmas LFG Bot - low resolution
                // https://i.imgur.com/pi35BxM.png // LFG Bot - first upload ( I think )
                /*

                let dailyChannel = client.channels.cache.get(('1049458524599636069'))
                
                const thread = dailyChannel.threads.create({
                    name: `Daily items: ${monthStr.get(DATE.MONTH)}`,
                    autoArchiveDuration: 1,
                    reason: 'New daily items'
                })
                */
                const ARRAYS = pushArrays(ITEM, itemArrays, embed, embedArrays, itemTypes)
                delete ITEM

                itemArrays = ARRAYS[0]
                embedArrays = ARRAYS[1]
            })
        })
        //console.log(embeds)
        
       //ItemShop.prototype.display(category, embedArr)
       //console.log(itemArrays)
       //console.log(embedArrays)

        console.log(`Items in ${category} shop:`)
        itemTypes.forEach((TYPE) => {
            const ITEMS = itemArrays.get(TYPE)

            const FULL = checkFull(embedArrays)[0]
            const FULL_ARRAY = checkFull(embedArrays)[1]

            if (FULL) console.log('Capacity reached')

            if (ITEMS.length > 0) {  
                const CHANNEL = CHANNELS.get(TYPE)
                console.log(`${TYPE}s (${ITEMS.length})`)

                const EMBEDS = embedArrays.get(TYPE)[1]
                //CHANNEL.send({embeds: [EMBEDS]})
            }        
        })


        //if (emoteArr.size > 0) { CHANNELS.get('Emotes').send({embeds: [emoteArr]}) }
        //if (gliderArr.size > 0) { CHANNELS.get('Glider').send({embeds: [gliderArr]}) }
        //if (backblingArr.size > 0) { CHANNELS.get('Backbling').send({embeds: [backblingArr]}) }
        //if (trailArr.size > 0) { CHANNELS.get('Trail').send({embeds: [trailArr]}) }
        //if (characterArr.size > 0) { CHANNELS.get('Character').send({embeds: [characterArr]}) }

        //client.channels.cache.get(('1049457107449171999')).send({embeds: [embed]})
        
        });
    });
}

function pushArrays(ITEM, itemArrays, embed, embedArrays, itemTypes) {
    itemTypes.forEach((TYPE) => {
        if( ITEM.type == TYPE ) {
            itemArrays.get(TYPE).push(ITEM)
            embedArrays.get(TYPE).push(embed)
        }
    })

    return [ itemArrays, embedArrays ]
}

function checkFull(array, capacity) { return ( array.length == capacity ) }

function sortArrays(embedArrays) {
    const CAPACITY = 10

    embedArrays.forEach(ARRAY => {
        const FULL = checkFull(ARRAY, CAPACITY)

        if (FULL) {
            
        }
    })

    return [full, array]
}

// Clears all messages from a channel by cloning channel and deleting old channel
async function clearChannels() {
    // Clone channel
    const newChannel = await channel.clone()
    console.log(newChannel.id) // Do with this new channel ID what you want

    // Delete old channel
    channel.delete()
}

ItemShop.prototype.display = function (category, embedArr) {
    const webhookClient = new WebhookClient({ id: process.env.SHOP_ID, token: process.env.SHOP_TOKEN});

    webhookClient.send({
        content: `${category}`,
        username: `Item Shop`,
        avatarURL: 'https://i.imgur.com/OfDWRMc.png',
        embeds: embedArr
    })
}

exports.ItemShop = ItemShop
exports.ItemShop.prototype.getDaily = ItemShop.prototype.getDaily
exports.ItemShop.prototype.display = ItemShop.prototype.display