const request = require('request');

module.exports = {
    /**
     * 
     * @param {import("irc-upd").Client} bot 
     */
    run(bot, nick, to, text, args) {
        if (!args[1]) {
			bot.say(to, 'Missing arguments. Usage example: !isup imdb.com , !isup www.imdb.com ');
		} else {
			args.shift();
			// if there's 'http(s)://' remove it
			var urlToCheck = args[0].replace(/(http:|https:)\/\//g, '');

			// some sites like google.com don't get checked properly without 'www.'
			// so it checks if users has included 'www.' in link, if not add 'www.'
			if (!urlToCheck.match(/(www\.)/g)) {
				urlToCheck = 'www.' + urlToCheck;
			}
			// before request, check if URL is OK, for example: www.example.123 would not allow request
			if (urlToCheck.match(/(www\.)\w+(\.)[a-zA-Z]/g)) {
				request('https://downforeveryoneorjustme.com/' + urlToCheck, function (error, response, body) {
					if (!error && response.statusCode === 200) {
						console.log(body)
						if (body.match(/It\'s just you/g)) {
							bot.say(to, 'Site is up!');
						} else if (body.match(/Huh\?/g)) {
							bot.say(to, 'Sorry pal, that URL does not seem to be correct..');
						} else {
							bot.say(to, 'Site is down!');
						}
					}
				});
			} else {
				bot.say(to, 'Sorry pal, that URL does not seem to be correct..');
			}
		}
    },

    config: {
        triggers: ["isup"],
        description: "Check if a website is up"
    }
}