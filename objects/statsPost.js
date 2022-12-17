const { Discord, EmbedBuilder, WebhookClient, StageInstancePrivacyLevel } = require("discord.js")

function StatsPost(message, client, USERNAME, member, hook) {
    console.log(StatsPost.prototype.getEpicID([message.member.id]))
    StatsPost.prototype.getEpicID([message.member.id]).then( epicID => {
        const userRequestURL = 'https://fortnite-api.com/v2/stats/br/v2/' + epicID
        const ApiKey = process.env.FORTNITE_API_KEY

        //const USERNAME = member.displayName

        console.log(`\nGetting ${member.displayName}'s stats`)
        
        fetch( userRequestURL, { headers: { Authorization: ApiKey }} )
        .then( response => { return response.json().then( data => {
            //if (response.ok) { console.log('Reponse ok') } else { console.log('Response not ok')}
            
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

            try { data.data.stats } catch (error) {
                //console.error(error);
                console.log('User has their profile set to private :(')
                console.log('*Bot is still running*\n')
                return
            }

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
                        case 'wins':
                            StatsPost.prototype.addRoles(statVal, message, member)
                            break
                    }

                    const addCommas = ['score', 'kills', 'deaths', 'matches', 'minutesPlayed']

                    if (addCommas.includes(stat)) { statVal = statVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }

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

            if (hook == 'stats') {
                const webhookClient = new WebhookClient({ id: process.env.STATS_ID, token: process.env.STATS_HOOK});

                webhookClient.send({
                    //content: 'Fortnite Stats',
                    username: 'Cr00kie',
                    avatarURL: 'https://i.imgur.com/zXsACwR.png',
                    embeds: [embed]
                })
            }

            if (hook == 'dev') {
                const webhookClient = new WebhookClient({ id: process.env.DEV_HOOK_ID, token: process.env.DEV_HOOK_TOKEN});

                webhookClient.send({
                    //content: 'Fortnite Stats',
                    username: 'Cr00kie',
                    avatarURL: 'https://i.imgur.com/zXsACwR.png',
                    embeds: [embed]
                })
            }
            });
        });
    }).catch(err => {
        console.log(err)
        console.log('Epic ID not found *bot still running*')
    })
}

StatsPost.prototype.testAPI = function () {
    const GUILD_ID = '1002418562733969448'
    const userRequestURL = 'https://yunite.xyz/api/v3/guild/' + GUILD_ID + '/registration/links'
    const ApiKey = process.env.YUNITE_API_KEY
    const ApiHeaders = new Headers()
    ApiHeaders.append('Y-Api-Token', ApiKey)
    ApiHeaders.append('Content-Type', 'application/json')
    
    fetch( userRequestURL, { method: 'POST', headers: ApiHeaders,
        body: JSON.stringify({
            "type": "DISCORD",
            "userIds": ["326529501209034764"]
        })
    })
    .then( response => {
        if (response.ok) { console.log('Reponse ok') } else { console.log('Response not ok')}
        
        return response.json().then( data => {
            console.log(data)
        });
    });
    
}

StatsPost.prototype.getEpicID = async function (discordIDs) {
    const GUILD_ID = '1002418562733969448' // Looking for Group 18+
    const userRequestURL = 'https://yunite.xyz/api/v3/guild/' + GUILD_ID + '/registration/links'
    const ApiKey = process.env.YUNITE_API_KEY
    const ApiHeaders = new Headers()
    ApiHeaders.append('Y-Api-Token', ApiKey)
    ApiHeaders.append('Content-Type', 'application/json')
    
    let promise = null

    await fetch( userRequestURL, { method: 'POST', headers: ApiHeaders, body: JSON.stringify({ "type": "DISCORD", "userIds": discordIDs }) }).then( response => {
        //if (response.ok) { console.log('Reponse ok') } else { console.log('Response not ok')}
        return response.json().then( data => {
            const users = data['users']
            //console.log(users[0].epic['epicID'])
            //console.log(`Returning ${users[0].epic['epicID']}`)
            promise = users[0].epic['epicID']
        });
    });

    return promise
}

StatsPost.prototype.addRoles = function (wins, message, member) {
    let absoluteGod = false
    let bigLeagues  = false
    const admin     = '1023498080600989726'
    const booster   = '1008396866481815583'

    /*
    if (message.member.roles.find(r => r.name === "Admin")) {
        console.log("User is an admin")
        return
    } else if (message.member.roles.find(r => r.name === "Booster")) {
        console.log("User is an booster")
        //return
    }
    */

    if ( wins > 1000 && wins < 2000) { bigLeagues = true } else if (wins >= 2000) { absoluteGod = true }

    let winOrder = ''
    let mapToSearch = new Map([])

    const owners = ['80768662570545152', '992579911946616843'] // Vexedly, JFC
    const admins = ['600504533445115905', '185179915920998401', '668993915285667860'] // cr00kie420, Lavittz1, RKN Sorrow
    const mods   = ['218775265403338763', '496511729736613899', '521658713279561742'] // LilGums, OuigaByte, Spiral5885

    // Roles that should only be given to owners (Vex and JFC)
    ownerRoles = [
        '1053540348800028682', '1053540345603964968', '1053537907903844433', '1053537905341104148',
        '1053537902711296112', '1053537900639289344', '1053537898118525039', '1053537895023132682',
        '1053537892263272449', '1053537828467916891', '1053538424977641542', '1053538428471488542',
        '1053538436616818769', '1053538439494127647', '1053538442404962386', '1053538445194170388',
        '1053538455122096168', '1053539148264378429', '1053539144871202887', '1053539150806143037',
        '1052164164153516062', '1023498080600989726'
    ]

    // Wins on the order of 100
    // Looks at 0000 digit
    //---------|^|---------
    const ranks = new Map([
        /* 100 Wins */ ['1', ['1053561276674084874', '1048664817885532270', '1053540348800028682'] ], // Last row are owners-only roles
        /* 200 Wins */ ['2', ['1052421555386335335', '1048664836776661022', '1053540345603964968'] ],
        /* 300 Wins */ ['3', ['1052421555386335335', '1052326361886363718', '1053537907903844433'] ],
        /* 400 Wins */ ['4', ['1052421555386335335', '1052326364889481309', '1053537905341104148'] ],
        /* 500 Wins */ ['5', ['1052347060839530546', '1048664868779200572', '1053537902711296112'] ],
        /* 600 Wins */ ['6', ['1052347060839530546', '1052328081735569559', '1053537900639289344'] ],
        /* 700 Wins */ ['7', ['1052347060839530546', '1052328084705116331', '1053537898118525039'] ],
        /* 800 Wins */ ['8', ['1052347060839530546', '1052328087938928784', '1053537895023132682'] ],
        /* 900 Wins */ ['9', ['1052347060839530546', '1052328079873294446', '1053537892263272449'] ],
    ])

    // Ranks for 1000+ wins
    // Looks at 0000 digit
    //----------|^|--------

    const highRanks = new Map([
        /* 1000 Wins */ ['0', ['1052347045425446932', '1048664888660213811', '1053537828467916891'] ], // Last row are owners-only roles
        /* 1100 Wins */ ['1', ['1052347045425446932', '1052329978529841152', '1053538424977641542'] ],
        /* 1200 Wins */ ['2', ['1052347045425446932', '1052329976415920240', '1053538428471488542'] ],
        /* 1300 Wins */ ['3', ['1052347045425446932', '1052329973647675512', '1053538436616818769'] ],
        /* 1400 Wins */ ['4', ['1052347045425446932', '1052329974725615749', '1053538439494127647'] ],
        /* 1500 Wins */ ['5', ['1052347045425446932', '1052329981302292511', '1053538442404962386'] ],
        /* 1600 Wins */ ['6', ['1052347045425446932', '1052329979284836413', '1053538445194170388'] ],
        /* 1700 Wins */ ['7', ['1052347045425446932', '1052329981096763464', '1053538455122096168'] ],
        /* 1800 Wins */ ['8', ['1052347045425446932', '1052329972762681404', '1053539148264378429'] ],
        /* 1900 Wins */ ['9', ['1052347045425446932', '1052330367111147560', '1053539144871202887'] ],
    ])

    const topTier = new Map([
        ['2', ['1052347036160233492', '1052156244988792934', '1053539150806143037']] // Last row is an owners-only role
    ])

    if (bigLeagues == false) {
        winOrder = String(wins)[0]   
        mapToSearch = ranks     
    } else {
        winOrder = String(wins)[1]
        mapToSearch = highRanks 
    }

    if (absoluteGod) {
        winOrder = String(wins)[0]
        mapToSearch = topTier 
    }

    const rolesToAdd = mapToSearch.get(winOrder)

    //console.log(`Target ID: ${member.id}`)

    // Owner roles
    if (admins.includes(member.id)) {
        if (wins >= 2000)
            rolesToAdd.push('1052372093167218748')
        else if (wins >= 1000)
            rolesToAdd.push('1052365049139843162')
        else if (wins >= 500)
            rolesToAdd.push('1052364371847815269')
        else if (wins >= 200)
            rolesToAdd.push('1052364373601034301')
        else if (wins >= 100)
            rolesToAdd.push('1052365969349165117')
        else
            rolesToAdd.push('1052369953149431868')
    }
    
    // Admin roles
    if (admins.includes(member.id)) {
        if (wins >= 2000)
            rolesToAdd.push('1052372093167218748')
        else if (wins >= 1000)
            rolesToAdd.push('1052365049139843162')
        else if (wins >= 500)
            rolesToAdd.push('1052364371847815269')
        else if (wins >= 200)
            rolesToAdd.push('1052364373601034301')
        else if (wins >= 100)
            rolesToAdd.push('1052365969349165117')
        else
            rolesToAdd.push('1052369953149431868')
    }

    // Mod roles
    if (mods.includes(member.id)) {
        if (wins >= 2000)
            rolesToAdd.push('1052372096514265138')
        else if (wins >= 1000)
            rolesToAdd.push('1052365418125332560')
        else if (wins >= 500)
            rolesToAdd.push('1011434142552039484')
        else if (wins >= 200)
            rolesToAdd.push('1052364496716447835')
        else if (wins >= 100)
            rolesToAdd.push('1052365425939337377')
        else
            rolesToAdd.push('1052369955129143376')
    }

    if (wins < 100) {
        console.log(`${member.displayName} is under level 100`)
        rolesToAdd = ['1052443982535331963'] // Only add this one role
    } 

    let isOwner = false

    if (owners.includes(member.id)) {
        isOwner = true
        rolesToAdd.push('1052164164153516062')
        //rolesToAdd.push('1023498080600989726')
    }

    rolesToAdd.forEach((role, idx) => {
        if (ownerRoles.includes(role)) {
            if (isOwner == true) member.roles.add(role)
        } else {
            if (isOwner == false) member.roles.add(role)
        }
    })

    console.log(`${member.displayName} was given roles for having ${wins} wins`)
}

exports.StatsPost = StatsPost
exports.StatsPost.prototype.testAPI = StatsPost.prototype.testAPI
exports.StatsPost.prototype.getEpicID = StatsPost.prototype.getEpicID