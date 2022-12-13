const { Discord, EmbedBuilder, WebhookClient, StageInstancePrivacyLevel } = require("discord.js")

function StatsPost(message, client) {
    const webhookClient = new WebhookClient({ id: process.env.STATS_ID, token: process.env.STATS_HOOK});

    let member = message.member

    const userRequestURL = 'https://fortnite-api.com/v2/stats/br/v2'

    const ApiKey = process.env.FORTNITE_API_KEY

    const USERNAME = member.displayName

    console.log(`\nGetting ${USERNAME}'s stats`)
    
    fetch( userRequestURL + '?name=' + USERNAME, { headers: { Authorization: ApiKey }} )
    .then( response => { return response.json().then( data => {
        const embed = new EmbedBuilder()

        this.username = USERNAME
        
        //const webhookClient = new WebhookClient({ id: process.env.HOOK_ID, token: process.env.HOOK_TOKEN});
        
        const statToStr = new Map([
            ['score', 'Score'],
            ['wins', 'Wins'],
            ['top10', 'Top 10 placements'],
            ['kills', 'Kills'],
            ['deaths', 'Deaths'],
            ['kd', 'k/d'],
            ['matches', 'Matches played'],
            ['winRate', 'Win rate'],
            ['minutesPlayed', 'Hours played'],
        ])

        for (const stat in data.data.stats.all.overall) {
            
            if ( statToStr.has(stat) ) {
                const statName = statToStr.get(stat)
                let statVal = data.data.stats.all.overall[stat]

                switch (stat) {
                    case 'minutesPlayed':
                        statVal /= 60        
                        statVal = Math.round(statVal)
                        break
                    case 'scorePerMatch':
                        statVal = Math.round(statVal)
                        break
                    case 'winRate':
                        statVal = Math.round(statVal)
                        statVal += '%'
                        break
                    case 'killsPerMatch':
                        statVal = Math.round(statVal)
                        break
                }

                const addCommas = ['score', 'kills', 'deaths', 'matches', 'minutesPlayed']

                if (addCommas.includes(stat)) {

                    statVal = statVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }

                //embed.setTitle(`${USERNAME}`)
                embed.setThumbnail('https://i.imgur.com/h9jaSKC.png')
                embed.addFields({ name: `${statName}`, value: `${statVal}`})
                embed.setColor(0x2f3136)
                
                //console.log(`${statToStr.get(stat)}: ${data.data.stats.all.overall[stat]}`)

                // https://i.imgur.com/h9jaSKC.png // LFG Bot
                // https://i.imgur.com/HgragK2.png // Chistmas LFG Bot - low resolution
                // https://i.imgur.com/pi35BxM.png // LFG Bot - first upload ( I think )
                // https://static.wikia.nocookie.net/fortnite/images/f/f0/Battle_Pass_-_Icon_-_Fortnite.png // Battlepass
            }
        }

        /*webhookClient.send({
            content: 'New **daily** items available',
            username: 'Fortnite Shop',
            avatarURL: 'https://i.imgur.com/OfDWRMc.png',
            embeds: embedArr
        })
        */
        
        embed.setFooter({ text: `${USERNAME} LVL ${data.data.battlePass.level}`, iconURL: 'https://static.wikia.nocookie.net/fortnite/images/f/f0/Battle_Pass_-_Icon_-_Fortnite.png' });

        //client.channels.cache.get(('1052015503998210088')).send({embeds: [embed]})
        
        webhookClient.send({
            //content: 'Fortnite Stats',
            username: 'Cr00kie',
            avatarURL: 'https://i.imgur.com/zXsACwR.png',
            embeds: [embed]
        })
        });
    });
}

exports.StatsPost = StatsPost