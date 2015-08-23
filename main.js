var irc = require('irc');

var client = new irc.Client('irc.rizon.net', 'jsbot', {
	channels: ['#randomtestingbots'],
	debug: true
});

Array.prototype.random = function () {
	return this[Math.floor(Math.random() * this.length)];
};

client.addListener('message', function (from, to, message) {
	try {
		// simple live reload
		require('./commands.js')(client, from, to, message);
		delete require.cache[require.resolve('./commands.js')];
	} catch (err) {
		console.log(err);
	}
});

client.addListener('error', function (message) {
	console.log('error: ', message);
});
