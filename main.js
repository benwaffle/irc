var irc = require('irc');
var debug = require('debug')('main.js');

var client = new irc.Client('irc.rizon.net', 'jsbot', {
	channels: ['#randomtestingbots'],
	debug: true
});

Array.prototype.random = function () {
	return this[Math.floor(Math.random() * this.length)];
};
Array.prototype.contains = function(obj) {
	return this.indexOf(obj) != -1;
};

var ignored = [];

client.addListener('message', function (from, to, message) {
	debug(from + ' => ' + to + ': ' + message);

	try {
		// simple live reload
		require('./commands.js')(client, ignored, from, to, message);
	} catch (err) {
		debug(err);
	}
	delete require.cache[require.resolve('./commands.js')];
});

client.addListener('error', function (message) {
	debug('error: ', message);
});
