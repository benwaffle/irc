var irc = require('irc');
var badwords = require('badwords/array');
var debug = require('debug')('commands.js');

const admin = 'benwaffle';
var client;
var dest;

module.exports = function (_client, from, to, message) {
	client = _client;
	// at the top so async functions can reply
	if (to[0] == '#') dest = to; // user => #channel
	else dest = from; // user => bot

	const commands = {
		// utility stuff
		'^,join #\\w+': function (from, to, msg) {
			var arg = msg.split(' ')[1];
			if (from == admin && arg[0] == '#')
				client.join(arg);
			else
				return irc.colors.wrap('light_red', 'you have no power here');
		},
		'^,part$': function (from, to) {
			if (from == admin && to[0] == '#')
				client.part(to);
			else
				return irc.colors.wrap('light_red', 'you have no power here');
		},
		// https://github.com/Teknikode/IBIP
		'^\\.bots$': 'Reporting in! [node.js] http://git.io/vsVQu',
	};

	// ,command
	commands['^,meanie$'] = function (from, to, msg) {
		return badwords.random();
	};
	commands['^,blasphemy$'] = function () {
		return require('blasphemy').blaspheme();
	};
	commands['^,8ball .+'] = function (from, to, msg) {
		return require('eightball')();
	};
	commands['^,dice( \\d+)'] = function (from, to, msg) {
		var count = parseInt(msg.split(' ')[1]) || 1;
		count = Math.min(count, 100);
		var reply = '';
		for (var i = 0; i < count; ++i)
			reply += ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'].random();
		return reply;
	};
	commands['^,source$'] = function (from, to, msg) {
		client.notice(from, 'My NLP magic is really just regex (http://git.io/vsVQu)');
	};

	developerExcuses(commands);

	commands['(fuck ?you|fuck ?off|eat a dick|kill yourself)'] = function (from, to, msg) {
		if (msg.indexOf(client.opt.nick) != -1)
			return ['stfu', 'shut up, you ' + badwords.random(), 'eh fuck you buddy', 'lalala not listening', 'leave me alone ;_;', '#stopbothate'].random();
		else
			return 'why you heff to be mad?';
	}

	commands['^test$'] = '✔';
	commands['^ay+$'] = 'lmao';
	commands['^420$'] = 'blaze it';
	commands['^same$'] = 'same';
	commands['^\\^$'] = 'can confirm';
	commands['^(hi|hello)$'] = 'hello';
	// causes infinite loop with similar bots
	// commands['^no u$'] = 'no u';

	for (var regex in commands) {
		if (message.trim().match(new RegExp(regex)) !== null) {;
			debug('matched /' + regex + '/');
			if (typeof commands[regex] == 'string') {
				client.say(dest, commands[regex]);
			} else {
				var reply = commands[regex](from, to, message);
				if (reply)
					client.say(dest, reply);
			}
			break;
		}
	}
};

function developerExcuses(commands) {
	var object = '(code|program|script)';
	var negative = '(never|no|does not|doesn\'?t|isn\'?t|is not)';
	var affirmative = '(always|sometimes|usually|often)';
	var codeactions = '(work|run)(s|ing)?';
	var codefailure = '(crash(ed|es)?|segfault)';
	var devexcuse = function () {
		require('developerexcuses')(function (err, excuses) {
			client.say(dest, excuses);
		});
	};
	commands[object + '\\s+' + affirmative + '?\\s+' + codefailure] = devexcuse;
	commands[object + '\\s+' + negative + '\\s+' + codeactions] = devexcuse;
}
