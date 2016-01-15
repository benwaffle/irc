const irc = require('irc')
const https = require('https')
const debug = require('debug')('main.js')

var client = new irc.Client('irc.rizon.net', 'jsbot', {
    channels: ['#pasta'],
    debug: true
})

const admin = 'benwaffle'

Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)]
}
Array.prototype.contains = function (obj) {
    return this.indexOf(obj) != -1
}

function richestUsers(cb) {
    https.get('https://wiiaam.com/moneys.txt', res => {
        var list = ''
        res.on('data', x => {
            list += x.toString();
        })
        res.on('end', () => {
            var richest = list
                .split('\n')
                .filter(l => l[0] != '#')
                .map(x => x.split('='))
                .sort((a, b) => b[1] - a[1])
            cb(richest);
        })
    })
}

var ignored = []

client.addListener('notice', function (nick, to, text, msg) {
    if (text.indexOf('msg NickServ IDENTIFY') > -1) {
        debug('authenticating')
        client.send('nickserv', 'IDENTIFY ' + require('./secrets.js').password)
    }
})

client.addListener('invite', function (channel, from, msg) {
    client.join(channel)
})

client.addListener('message', function (from, to, message) {
    message = message.trim()
    debug(from + ' => ' + to + ': ' + message)

    if (ignored.contains(from))
        return

    var dest = ''
    if (to[0] == '#')
        dest = to // user => #channel
    else
        dest = from // user => bot

    function warnNotAdmin() {
        return irc.colors.wrap('light_red', 'check your (administrative) privilege')
    }

    const commands = {
        // utility stuff
        '^,join #[^, ]+$': function (from, to, msg) {
            if (from == admin)
                client.join(msg.split(' ')[1])
            else
                return warnNotAdmin()
        },
        '^,part$': function (from, to) {
            if (from == admin && to[0] == '#')
                client.part(to)
            else
                return warnNotAdmin()
        },
        '^,say \\S+ .+': function (from, to, msg) {
            if (from == admin) { // only admin => bot will trigger this
                var args = msg.split(' ')
                client.say(args[1], args.slice(2).join(' '))
            }
        },
        '^,ignore \\w+': function (from, to, msg) {
            if (from == admin) {
                var user = msg.split(' ')[1]
                if (user != admin)
                    ignored.push(user)
            } else {
                return warnNotAdmin()
            }
        },
        '^,unignore \\w+': function (from, to, msg) {
            if (from == admin) {
                var user = msg.split(' ')[1]
                delete ignored[ignored.indexOf(user)]
            } else {
                return warnNotAdmin()
            }
        },
        // https://github.com/Teknikode/IBIP
        '^\\.bots$': 'Reporting in! [node.js] https://github.com/benwaffle/irc'
    }

    // ,command
    commands['^,blasphemy$'] = function () {
        return require('blasphemy').blaspheme()
    }
    commands['^,8ball .+'] = function () {
        return require('eightball')()
    }
    commands['^,dice( \\d+)'] = function (from, to, msg) {
        var count = parseInt(msg.split(' ')[1]) || 1
        count = Math.min(count, 100)
        var reply = ''
        for (var i = 0; i < count; ++i)
            reply += ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'].random()
        return reply
    }
    commands['^,source$'] = function (from, to, msg) {
        client.notice(from, 'https://github.com/benwaffle/irc')
    }
    commands['^,insult$'] = function () {
        return require('./responses.js').insults.random()
    }
    commands['^,compliment$'] = function () {
        return require('./responses.js').compliments.random()
    }
    commands['^,money$'] = function (from, to) {
        if (to == '#pasta')
            return '!money\n' + '.money'
    }
    commands['^,london .+'] = function (from, to, message) {
        function rep(str, x) {
            var ret = ''
            for (var i = 0; i < x; ++i)
                ret += str
            return ret
        }

        var msg = message.substring(',london '.length).toUpperCase()
        var london = ''
        for (var i = 0; i < msg.length; ++i)
            london += msg[i] + ' '
        london += '\n'
        for (var i = 1; i < msg.length - 1; ++i)
            london += msg[i] + rep('  ', msg.length - 2) + ' ' + msg[msg.length - i - 1] + '\n'
        for (var i = 0; i < msg.length; ++i)
            london += msg[msg.length - i - 1] + ' '
        return london
    }
    commands['^,gay \\w+'] = function (from, to, msg) {
        if (msg.length > 20) msg = msg.substring(0, 20)
        var colors = [
            'dark_red',
            'light_red',
            'orange',
            'yellow',
            'light_green',
            'dark_green',
            'dark_blue',
            'light_blue',
            'cyan',
            'light_cyan',
            'magenta',
            'light_magenta',
        ]

        msg = msg.split(' ').slice(1).join(' ')
        var gay = ''
        var ci = 0
        for (var i = 0; i < msg.length; ++i) {
            for (var c = 0; c < msg.length; ++c) {
                gay += irc.colors.wrap(colors.random(), msg[c])
            }
            gay += '\n'
            msg = msg[msg.length - 1] + msg.substring(0, msg.length - 1)
        }
        return gay
    }
    commands['^\\[.+\\]$'] = function (from, to, msg) {
        var str = msg.substring(1, msg.length - 1)
        return irc.colors.wrap('bold', '[' + str.toUpperCase() + ' INTENSIFIES]')
    }
    commands['^,richest$'] = function (from, to, msg) {
        if (to == '#pasta') {
            richestUsers(list => {
                let top = list.slice(0, 5)
                for (let u of top) {
                    let name = (u[0] + '            ').slice(0, 10)
                    client.say('#pasta', `${name}${u[1]}`)
                }
            })
        }
    }

    var object = '(code|program|script|app)'
    var negative = '(never|no|does not|doesn\'?t|isn\'?t|is not)'
    var affirmative = '(always|sometimes|usually|often)'
    var codeactions = '(work|run)(s|ing)?'
    var codefailure = '(crash(ed|es)?|segfault|is buggy|has bugs)'
    var devexcuse = function () {
        require('developerexcuses')(function (err, excuses) {
            client.say(dest, excuses)
        })
    }
    commands[object + '\\s+' + affirmative + '?\\s+' + codefailure] = devexcuse
    commands[object + '\\s+' + negative + '\\s+' + codeactions] = devexcuse

    commands['(fuck ?you|fuck ?off|eat a dick|kill (yo)?urself|shut (the fuck )?up)'] = function (from, to, msg) {
        if (msg.indexOf(client.opt.nick) != -1)
            return ['stfu', 'shut up, you ' + require('badwords/array').random(), 'eh fuck you buddy', 'lalala not listening', 'leave me alone ;_;', '#stopbothate'].random()
        else
            return 'why you heff to be mad?'
    }

    commands['^test$'] = '✔'
    commands['^ay+$'] = 'lmao'
    commands['^420$'] = 'blaze it'
    commands['^same$'] = 'same'
    commands['^\\^$'] = 'can confirm'
    commands['^(hi|hello)$'] = 'hello'
    commands['^ping$'] = 'pong'
    commands['\\b(rip|RIP)\\b'] = ';_;'
    // causes infinite loop with similar bots
    // commands['^no u$'] = 'no u';

    for (let regex in commands) {
        if (message.match(new RegExp(regex)) !== null) {
            debug('matched /' + regex + '/')
            if (typeof commands[regex] == 'string') {
                client.say(dest, commands[regex])
            } else if (typeof commands[regex] == 'function') {
                var reply = commands[regex](from, to, message)
                if (reply)
                    client.say(dest, reply)
            }
            break
        }
    }
})

client.addListener('error', function (message) {
    debug('error: ', message)
})

setInterval(() => {
    client.say('#pasta', '!pay')
}, 1000 * 60 * 60 * 6 + 1000 * 2) // 6 hour + 2 sec

setInterval(() => {
    client.say('#pasta', '.bene')
}, 1000 * 60 * 60 + 1000 * 2) // 1 hr + 2 sec

setInterval(() => {
    richestUsers(list => {
        var richest = list.filter(u => u[0] != client.opt.nick)[0]
        client.say('#pasta', '.mug ' + richest[0])
    })
}, 1000 * 60 * 5 + 1000 * 2) // extra 2 seconds
