const querystring = require('querystring'),
	request = require('request');

module.exports = {
    /**
     * 
     * @param {import("irc-upd").Client} bot 
     */
    run(bot, nick, to, text, args) {
        if (!args[0]) {
			bot.say(to, 'Missing arguments. Usage example: !wp NodeJS');
		} else {
			args = args.join(' ');
			var titleSecondTry = args;	// save a copy for later use - if string has to be capitalized: martin scorsese -> Martin Scorsese
			var title = querystring.stringify({ titles: args });
			var wiki = 'https://en.wikipedia.org/w/api.php?continue=&action=query&' + title + '&indexpageids=&prop=extracts&exintro=&explaintext=&format=json';

			request(wiki, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					var wikiSummary = JSON.parse(body);
					var pageId = wikiSummary.query.pageids[0];	// get pageID

					// if pageId is -1 then the article does not exist
					if (pageId === '-1') {

						// Try again with changing first letter of every word to upper case
						titleSecondTry = titleSecondTry.replace(/[^\s]+/g, function (word) {
							return word.replace(/^./, function (first) {
								return first.toUpperCase();
							});
						});

						titleSecondTry = querystring.stringify({ titles: titleSecondTry });

						wiki = 'https://en.wikipedia.org/w/api.php?continue=&action=query&' + titleSecondTry + '&indexpageids=&prop=extracts&exintro=&explaintext=&format=json';
						request(wiki, function (err, res, bod) {
							if (!err && res.statusCode === 200) {
								wikiSummary = JSON.parse(bod);
								pageId = wikiSummary.query.pageids[0];
								if (pageId === '-1') {
									bot.say(to, 'Article does not exist or could not be found. Sorry :C');
								} else {
									wikiSummary = wikiSummary.query.pages[pageId].extract;
									wikiSummary = wikiSummary.slice(0, 280);
									var checkRedirect = wikiSummary.slice(0, 70);
									if (checkRedirect === 'This is a redirect from a title with another method of capitalisation.') {
										bot.say(to, 'Article is redirecting, please use the following link: https://en.wikipedia.org/wiki/' + titleSecondTry.slice(7));
									} else {
										wikiSummary = wikiSummary.concat('... Read more: ' + 'https://en.wikipedia.org/wiki/' + titleSecondTry.slice(7));
										bot.say(to, wikiSummary);
									}
								}
							}
						});
					} else {
						wikiSummary = wikiSummary.query.pages[pageId].extract;
						wikiSummary = wikiSummary.slice(0, 280);
						var checkRedirect = wikiSummary.slice(0, 70);
						if (checkRedirect === 'This is a redirect from a title with another method of capitalisation.') {
							bot.say(to, 'Article is redirecting, please use the following link: https://en.wikipedia.org/wiki/' + title.slice(7));
						} else {
							wikiSummary = wikiSummary.concat('... Read more: ' + 'https://en.wikipedia.org/wiki/' + title.slice(7));
							bot.say(to, wikiSummary);
						}
					}
				}
			});
		}
    },

    config: {
        triggers: ["wikipedia", "wp"],
        description: "Wikipedia summary"
    }
}