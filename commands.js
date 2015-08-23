var irc = require('irc');

module.exports = function (client, from, to, message) {
	const admin = 'benwaffle';
	const commands = {
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

		'^,help$': function (from, to) {
			client.notice(from, 'Try: \t meanie \t blasphemy \t 8ball <question> \t dice');
		},
		'^,meanie$': function (from, to, msg) {
			return require('badwords/array').random();
		},
		'^,blasphemy$': function () {
			return require('blasphemy').blaspheme();
		},
		'^,8ball .+': function (from, to, msg) {
			return require('eightball')();
		},
		'^,dice$': function () {
			return ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'].random();
		},
		'fuck you': 'why you heff to be mad?',
		'^test$': '✔',
		'^ayy$': 'lmao',
		'^420$': 'blaze it',
		'^same$': 'same',
		'^no u$': 'no u',
	};

	console.log(from + ' => ' + to + ': ' + message);

	var dest = '';
	if (to[0] == '#') // user => #channel
		dest = to;
	else // user => bot
		dest = from;

	for (var regex in commands) {
		if (message.match(new RegExp(regex)) !== null) {
			console.log('matched /' + regex + '/');
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
