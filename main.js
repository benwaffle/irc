var irc = require('irc');
var debug = require('debug')('main.js');

var client = new irc.Client('irc.rizon.net', 'jsbot', {
	channels: ['#randomtestingbots'],
	debug: true
});

Array.prototype.random = function () {
	return this[Math.floor(Math.random() * this.length)];
};

client.addListener('message', function (from, to, message) {
	debug(from + ' => ' + to + ': ' + message);

	try {
		// simple live reload
		require('./commands.js')(client, from, to, message);
	} catch (err) {
		debug(err);
	}
	delete require.cache[require.resolve('./commands.js')];
});

client.addListener('error', function (message) {
	debug('error: ', message);
});
