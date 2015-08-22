var irc = require('irc');
var badwords = require('badwords/array');
var blasphemer = require('blasphemy');
var eightball = require('eightball');

var client = new irc.Client('irc.rizon.net', 'jsbot', {
	channels: ['#randomtestingbots'],
	debug: true
});

Array.prototype.random = function () {
		return this[Math.floor(Math.random() * this.length)];
};

const admin = 'benwaffle';
const activator = ',';
const commands = {
	'^,join #\\w+': function (from, to, msg) {
		var arg = msg.split(' ')[1];
		if (from == admin && arg[0] == '#')
			client.join(arg);
		else
			return irc.colors.wrap('light_red', 'you have no power here');
	},
	'^,part': function (from, to) {
		if (from == admin && to[0] == '#')
			client.part(to);
		else
			return irc.colors.wrap('light_red', 'you have no power here');
	},
	'^\\.bots$': function () {
		return 'Reporting in! ' + irc.colors.wrap('light_green', '[node.js™]') +  ' http://git.io/vsVQu';
	},

	'^,meanie': function (from, to, msg) {
		return badwords.random();
	},
	'^,blasphemy': function () {
		return blasphemer.blaspheme();
	},
	'^,8ball': function (from, to, msg) {
		if (msg.split(' ').length > 1)
			return eightball();
	},
	'^,fku': function () {
		return 'why you heff to be mad?';
	},
	'^,dice': function (from, to, args) {
		return ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'].random();
	},
	'^,help': function (from, to) {
		client.notice(from, 'Try: meanie \t blasphemy \t 8ball <question> \t fku \t dice');
	},
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
			console.log('matched /' + regex + '/');

			var reply = commands[regex](from, to, message);
			if (reply)
				client.say(dest, reply);
			break;
		}
	}
});

client.addListener('error', function (message) {
	console.log('error: ', message);
});
