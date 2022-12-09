const Discord = require("discord.js")

function ItemShop() {
    this.items = []

    return this
}

LfgPost.prototype.updateShop = function(member, post, client, message) {
    const userRequestURL = 'https://fortnite-api.com/v2/shop/br/combined'
    const ApiKey = process.env.FORTNITE_API_KEY

    const USERNAME = member.displayName

    fetch( userRequestURL + '?name=' + USERNAME, { headers: { Authorization: ApiKey }} )
    .then( response => { return response.json().then( data => {
        let embedArr = []

        const webhookClient = new WebhookClient({ id: process.env.HOOK_ID, token: process.env.HOOK_TOKEN});

        //console.log(data.data.dail.entries)
        data.data.featured.entries.forEach(entry => {
            entry.items.forEach(item => {
                const embed = new EmbedBuilder()
                .setColor(0x2f3136) // Refers to the line to the left of an embedded message
                //.setTitle(`${item.name}`)
                .setThumbnail(item.images.icon)
                .addFields({ name: `${item.name}`, value: `${item.description}`})
                .setFooter({ text: ` `, iconURL: 'https://i.imgur.com/pi35BxM.png' });

                let firstAvailable = item.shopHistory[0]
                firstAvailable = firstAvailable.slice(0, firstAvailable.length - 10).split('-')
                
                const DATE_FIRST = {
                    DAY:   firstAvailable[2],
                    MONTH: firstAvailable[1],
                    YEAR:  firstAvailable[0],
                }
                
                let lastAvailable = 'never'
                
                if (item.shopHistory.length > 2) {
                    lastAvailable = item.shopHistory[item.shopHistory.length - 2]
                    if (lastAvailable.length > 10) lastAvailable = lastAvailable.slice(0, lastAvailable.length - 10).split('-')

                    const DATE_LAST = {
                        DAY:   lastAvailable[2],
                        MONTH: lastAvailable[1],
                        YEAR:  lastAvailable[0],
                    }

                    embed.addFields({ name: `History`, value: `Last on sale: ${monthStr.get(DATE_LAST.MONTH)} ${DATE_LAST.YEAR}\nReleased: ${monthStr.get(DATE_FIRST.MONTH)} ${DATE_FIRST.YEAR}`})
                    //console.log (firstAvailable.slice(0, firstAvailable.length - 11))
                } else if (item.shopHistory.length == 2) { // Re-released for the first time, now
                    embed.addFields({ name: `History`, value: `Released: ${monthStr.get(DATE_FIRST.MONTH)} ${DATE_FIRST.YEAR}\nFirst time back in the shop!`})
                } else if (item.shopHistory.length == 1) { // New release
                    embed.addFields({ name: `History`, value: `Released: ${monthStr.get(DATE_FIRST.MONTH)} ${DATE_FIRST.YEAR}\nNew item!`})
                }

                embedArr.push(embed)
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
                
                
            })
        })
        //console.log(embeds)
        
        webhookClient.send({
            content: 'New **daily** items available',
            username: 'Fortnite Shop',
            avatarURL: 'https://i.imgur.com/OfDWRMc.png',
            embeds: embedArr
        })

        //client.channels.cache.get(('1049457107449171999')).send({embeds: [embed]})
        
        });
    });
}

exports.ItemShop = ItemShop