const moment = require('moment'),
	request = require('request'),
	{ zeroPad } = require("../util/util");

module.exports = {
    /**
     * 
     * @param {import("irc-upd").Client} bot 
     */
    run(bot, nick, to, text, args) {
        if (!args[1]) {
			bot.say(to, 'Missing arguments. Usage example: !tv Suits; !next Top Gear; !last The Simpsons');
		} else {
			var argInput = args[0];
			args.shift();
			args = args.join(' ');
			var TVMazeAPI = 'http://api.tvmaze.com/singlesearch/shows?q=' + args + '&embed[]=previousepisode&embed[]=nextepisode';

			request(TVMazeAPI, function(error, response, body) {
				var showSummary;
				if (!error && response.statusCode === 200) {
					body = JSON.parse(body);
					var showName = body.name,
						showUrl = body.url,
						showGenre = 'Genre: ' + body.genres.join(', '),
						showStatus = 'Status: ' + body.status,
						showStartDate = 'Premiered: ' + body.premiered,
						showLastEpInfo,
						showNextEpInfo,
						showLastEpAired, showLastEpAgo, showLastSeasonNum, showLastEpNum, showLastEp, showLastEpName,
						showNextEp, showNextEpName, showNextEpAir;

					if (body._embedded.previousepisode) {
						showLastEpAired = body._embedded.previousepisode.airstamp;
						showLastEpAgo = 'Last episode aired: ' + moment(showLastEpAired).countdown().toString() + ' ago';
						showLastSeasonNum = body._embedded.previousepisode.season;
						showLastEpNum = body._embedded.previousepisode.number;
						showLastEp = 'Number: S' + zeroPad(showLastSeasonNum) + 'E' + zeroPad(showLastEpNum);
						showLastEpName = 'Title: ' + body._embedded.previousepisode.name;
						showLastEpInfo = showLastEpAgo + ' | ' + showLastEp + ' | ' + showLastEpName;
					} else {
						showLastEpInfo = 'No info about last episode';
					}

					if (body._embedded.nextepisode) {
						showNextEp = 'Number: S' + zeroPad(body._embedded.nextepisode.season) + 'E' + zeroPad(body._embedded.nextepisode.number);
						showNextEpName = 'Title: ' + body._embedded.nextepisode.name;
						showNextEpAir = body._embedded.nextepisode.airstamp;
						showNextEpInfo = 'Next episode is in ' + moment(showNextEpAir).countdown().toString() + ' | ' + showNextEp + ' | ' + showNextEpName;
					} else {
						if (body.status === 'Ended') {
							showNextEpInfo = 'Show has ended';
						} else {
							showNextEpInfo = 'No info about next episode';
						}
					}

					if (argInput === '!tv') {
						showSummary = 'TVMaze info: ' + showName + ' | ' + showGenre + ' | ' + showStatus +
									' | ' + showStartDate + ' | ' + showLastEpInfo + ' | ' + showUrl;
					} else if (argInput === '!next') {
						showSummary = 'TVMaze info: ' + showName + ' | ' + showNextEpInfo + ' | ' + showUrl;
					} else if (argInput === '!last') {
						showSummary = 'TVMaze info: ' + showName + ' | ' + showLastEpInfo + ' | ' + showUrl;
					}
					bot.say(to, showSummary);

				} else {
					bot.say(to, 'TVMaze: Couldn\'t parse data');
				}

			});
		}
    },

    config: {
        triggers: ["tv", "next", "last"],
        description: "Check TV show info"
    }
}