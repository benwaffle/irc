var irc = require('irc');
var badwords = require('badwords/array');

var client = new irc.Client('irc.rizon.net', 'memebot', {
	channels: ['#randomtestingbots'],
	debug: true
});

const admin = 'benwaffle';
const activator = ',';
const commands = {
	meanie: function (from, to, args) {
		var count = 1;
		if (args && args[0].length > 0)
			count = parseInt(args[0]);
		if (count > 30)
			count = 30;
		var reply = '';
		for (var i = 0; i < count; ++i)
			reply += badwords[Math.floor(Math.random()*badwords.length)] + ' ';
		return reply;
	},
	join: function (from, to, args) {
		if (from == admin && args && args[0][0] == '#')
			client.join(args[0]);
	},
	part: function (from, to, args) {
		if (from == admin && to[0] == '#')
			client.part(to);
	}
};

client.addListener('message', function (from, to, message) {
	console.log(from + ' => ' + to + ': ' + message);

	var dest = '';
	if (to[0] == '#') // user => #channel
		dest = to;
	else // user => bot
		dest = from;

	var msgArr = message.split(' ');
	for (var cmd in commands) {
		if (activator + cmd == msgArr[0]) {
			var args = msgArr.slice(1);
			if (args.length == 0) args = undefined;

			console.log(cmd + '(' + from + ', ' + to + ', [' + args + '])');
			var reply = commands[cmd](from, to, args);
			if (reply)
				client.say(dest, reply);
			break;
		}
	}
});

client.addListener('error', function (message) {
	console.log('error: ', message);
});
