const { Discord, EmbedBuilder, WebhookClient, StageInstancePrivacyLevel } = require("discord.js")
const { debug } = require('../debug.json')

// Guild ID of the Discord server
const GUILD_ID = '1002418562733969448'

/* Values to subtract from VexedIy's stats */
const TO_SUBTRACT = new Map([
    ['score', 434902],
    ['wins', 200],
    ['kills', 9550],
    ['deaths', 6367],
    ['kd', 0],
    ['matches', 6569],
    ['winRate', 0],
    ['minutesPlayed', 18916]
])

function StatsPost(message, extraStats) {
    const discordUsername = message.member.displayName
    const ApiKey = process.env.FORTNITE_API_KEY

    StatsPost.prototype.getEpicID([message.member.id]).then( epicID => {
        const VEX = (message.member.id == '80768662570545152')
        const vexWins = null

        let webhookClient = null

        /* Select Webhook based on PC type being used (Laptop, Desktop) */
        if (debug) { webhookClient = new WebhookClient({ id: process.env.DEV_HOOK_ID, token: process.env.DEV_HOOK_TOKEN}) }
        else { webhookClient = new WebhookClient({ id: process.env.STATS_ID, token: process.env.STATS_HOOK}) }

        const userRequestURL = 'https://fortnite-api.com/v2/stats/br/v2/' + epicID        
        fetch( userRequestURL, { headers: { Authorization: ApiKey }} )
        .then( response => { return response.json().then( data => {
            //if (response.ok) { console.log('Reponse ok') } else { console.log('Response not ok')}
            const statToStr = new Map([
                ['score', 'Score'],
                ['wins', 'Wins'],
                ['kills', 'Kills'],
                ['deaths', 'Deaths'],
                ['kd', 'k/d'],
                ['matches', 'Matches played'],
                ['winRate', 'Win rate'],
                ['minutesPlayed', 'Hours played'],
            ])
            
            // List of value types to add commas into
            const addCommas = ['score', 'kills', 'deaths', 'matches', 'minutesPlayed']
            const embed = new EmbedBuilder()
            
            /* If a user's stats can't be retrieved: */
            try { data.data.stats } catch (error) {
                message.reply(`Couldn't get stats. Your profile might be set to private`)
                
                console.log(
                    `Stats for ${epicID} couldn't be retrieved from FortniteTracker\n` +
                    `${error}`
                )
                
                return
            }

            const overallStats = data.data.stats.all.overall

            for ( const stat in overallStats ) {
                if ( statToStr.has(stat) ) {
                    const statName = statToStr.get(stat)
                    let statVal = overallStats[stat]
                    
                    // Subtract from stats for VexedIy
                    if ( VEX && TO_SUBTRACT.has(stat)) {
                        statVal -= TO_SUBTRACT.get(stat)
                    }

                    /* Add stats and extra stats together, except for 'kd' and 'winRate' */
                    if ( (stat != 'kd') && (stat != 'winRate') ) {
                        if (extraStats != null) {
                            if (extraStats.has(stat)) {
                                statVal += extraStats.get(stat)
                            }
                        }
                    }

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
                            const WINS = statVal
                            const MEMBER = message.member
        
                            StatsPost.prototype.addRoles(MEMBER, WINS)
                            break
                    }

                    /* Add commas to certain stats */
                    if ( addCommas.includes(stat) ) { statVal = statVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }

                    //embed.setTitle(`${discordUsername}`)
                    embed.setThumbnail('https://i.imgur.com/h9jaSKC.png')
                    embed.addFields({ name: `${statName}`, value: `${statVal}`})
                    embed.setColor(0x2f3136)
                    
                    // https://i.imgur.com/h9jaSKC.png // LFG Bot
                    // https://i.imgur.com/HgragK2.png // Chistmas LFG Bot - low resolution
                    // https://i.imgur.com/pi35BxM.png // LFG Bot - first upload ( I think )
                    // https://static.wikia.nocookie.net/fortnite/images/f/f0/Battle_Pass_-_Icon_-_Fortnite.png // Battlepass
                }
            }

            embed.setFooter({ text: `${discordUsername} LVL ${data.data.battlePass.level}`, iconURL: 'https://static.wikia.nocookie.net/fortnite/images/f/f0/Battle_Pass_-_Icon_-_Fortnite.png' });

            webhookClient.send({
            //  content: 'Fortnite Stats',
                username: 'Cr00kie',
                avatarURL: 'https://i.imgur.com/zXsACwR.png',
                embeds: [embed]
            })
            
            console.log(`Stats retrieved!`)
        })
        });
    }).catch(err => {
        console.log(err)
        console.log('Bot is still running*')
    })
}

// Create map of stats from a Fortnite username
// Returns a promise, then the map
StatsPost.prototype.getExtraStats = async function (username) {
    const userRequestURL = 'https://fortnite-api.com/v2/stats/br/v2/?name=' + username
    const ApiKey = process.env.FORTNITE_API_KEY
            
    let promise = null
    let stats = new Map([['score', ''], ['wins', ''], ['kills', ''],
        ['deaths', ''], ['kd', ''], ['matches', ''], ['winRate', ''], ['minutesPlayed', '']
    ])

    await fetch( userRequestURL, { headers: { Authorization: ApiKey }} )
    .then( response => {
        return response.json().then( data => {
            try { data.data.stats } catch (error) {
                console.log(`${username}'s stats couldn't be retrieved...`)
                return
            }

            const overallStats = data.data.stats.all.overall

            for (const stat in overallStats) {
                if ( stats.has(stat) ) {
                    let statVal = overallStats[stat]
                    stats.set(stat, statVal)
                }
            }
            
            promise = stats
            //console.log(`Stats for ${username} have been retrieved`)
        });
    });

    return promise
}

// Only used during debugging
// Display results from an API
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
        
        return response.json().then( data => { console.log(data) });
    });
}

// Returns promise, then epic ID from Yunite
// Requires input of the user's Discord ID
StatsPost.prototype.getEpicID = async function ( discordIDs ) {
    const userRequestURL = 'https://yunite.xyz/api/v3/guild/' + GUILD_ID + '/registration/links'
    const ApiKey = process.env.YUNITE_API_KEY
    const ApiHeaders = new Headers()
    ApiHeaders.append('Y-Api-Token', ApiKey)
    ApiHeaders.append('Content-Type', 'application/json')
    
    let promise = null

    console.log(`Retrieving Fortnite ID from Yunite...`)

    await fetch( userRequestURL, { method: 'POST', headers: ApiHeaders, body: JSON.stringify({ "type": "DISCORD", "userIds": discordIDs }) }).then( response => {
        //if (response.ok) { console.log('Reponse ok') } else { console.log('Response not ok')}
        return response.json().then( data => {
            const users = data['users']
            
            try { users[0].epic } catch (error) {
                console.log(users[0])
                console.log(error)
            }

            promise = users[0].epic['epicID']
        });
    });

    return promise
}

StatsPost.prototype.addRoles = function (member, wins) {
    const admin     = '1023498080600989726'
    const booster   = '1008396866481815583'
    
    let absoluteGod = false
    let bigLeagues  = false

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

    // Last row is an owners-only role
    const topTier = new Map ([[ '2', ['1052347036160233492', '1052156244988792934', '1053539150806143037'] ]])

    if ( bigLeagues == false ) {
        winOrder = String(wins)[0]   
        mapToSearch = ranks     
    } else {
        winOrder = String(wins)[1]
        mapToSearch = highRanks 
    }

    if ( absoluteGod ) {
        winOrder = String(wins)[0]
        mapToSearch = topTier
    }

    let rolesToAdd = mapToSearch.get(winOrder)

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
        console.log(`${member.displayName} has fewer than 100 victory royales`)
        rolesToAdd = ['1052443982535331963'] // Only add this one role
    } 

    let isOwner = false

    if (owners.includes(member.id)) { isOwner = true, rolesToAdd.push('1052164164153516062') }

    rolesToAdd.forEach((role) => {
        if (ownerRoles.includes(role)) {
            if (isOwner == true) member.roles.add(role)
        } else {
            if (isOwner == false) member.roles.add(role)
        }
    })

    console.log(`${member.displayName} was given ${rolesToAdd.length} roles`)
}

exports.StatsPost = StatsPost
exports.StatsPost.prototype.testAPI = StatsPost.prototype.testAPI
exports.StatsPost.prototype.getEpicID = StatsPost.prototype.getEpicID
exports.StatsPost.prototype.getExtraStats = StatsPost.prototype.getExtraStats