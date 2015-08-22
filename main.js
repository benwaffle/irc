var irc = require('irc');
var badwords = require('badwords/array');
var blasphemer = require('blasphemy');
var eightball = require('eightball');

var client = new irc.Client('irc.rizon.net', 'memebot', {
	channels: ['#randomtestingbots'],
	debug: true
});

const admin = 'benwaffle';
const activator = ',';
const commands = {
	'^,join #\\w+': function (from, to, args) {
		if (from == admin && args && args[0][0] == '#')
			client.join(args[0]);
		else
			return ''
	},
	'^,part #\\w+': function (from, to) {
		if (from == admin && to[0] == '#')
			client.part(to);
	},
	'^\\.bots$': function () {
		return 'Reporting in! [node.js] the only real dev language';
	},
	'^,meanie( \\d+)?': function (from, to, args) {
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
	'^,blasphemy': function () {
		return blasphemer.blaspheme();
	},
	'^,8ball': function (from, to, args) {
		if (args)
			return eightball();
	},
	'^,fku': function () {
		return 'why you heff to be mad?';
	}
};

client.addListener('message', function (from, to, message) {
	console.log(from + ' => ' + to + ': ' + message);

	var dest = '';
	if (to[0] == '#') // user => #channel
		dest = to;
	else // user => bot
		dest = from;

	for (var regex in commands) {
		if (message.match(new RegExp(regex)) !== null) {
			var args = message.split(' ').slice(1);
			if (args.length == 0)
				args = undefined; // functions can just check if (args)

			console.log('matched /' + regex + '/ [' + args + ']');

			var reply = commands[regex](from, to, args);
			if (reply)
				client.say(dest, reply);
			break;
		}
	}
});

client.addListener('error', function (message) {
	console.log('error: ', message);
});
