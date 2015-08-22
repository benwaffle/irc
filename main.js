var irc = require('irc');
var badwords = require('badwords/array');

var client = new irc.Client('irc.rizon.net', 'memebot', {
	channels: ['#pasta'],
	debug: true
});

const activator = ',';
const commands = {
	meanie: function (from, to, args) {
		var count = 1;
		if (args.length > 0 && args[0].length > 0)
			count = parseInt(args[0]);
		if (count > 30)
			count = 30;
		var reply = '';
		for (var i = 0; i < count; ++i)
			reply += badwords[Math.floor(Math.random()*badwords.length)] + ' ';
		return reply;
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
			var reply = commands[cmd](from, to, msgArr.slice(1));
			if (reply !== undefined)
				client.say(dest, reply);
		}
	}
});

client.addListener('error', function (message) {
	console.log('error: ', message);
});
