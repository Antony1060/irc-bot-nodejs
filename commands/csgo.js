const config = require('../config'),

// node modules defined in package.json

	c = require('irc-colors'),
	moment = require('moment'),
	request = require('request'),
	_ = require('lodash'),
	{ nanToZero } = require("../util/util");

module.exports = {
    /**
     * 
     * @param {import("irc-upd").Client} bot 
     */
    run(bot, nick, to, text, args) {
        var API = 'http://api.steampowered.com';
		var appid = '?key=' + config.steam;
		var chanoutput;
		if (!args[0]) {
			bot.say(to, 'You have to supply an user name in order to see some stats.');
		} else {
			request({
				uri: API + '/ISteamUser/ResolveVanityURL/v0001/' + appid + '&vanityurl=' + args[0],
				json: true
			}, function(error, response, body) {
				var uSteamID;
				if (body.response.success === 1) {
					uSteamID = body.response.steamid;
				} else {
					if (args[0].match(/\d{17}/)) {
						uSteamID = args[0];
					}
				}

				request({
					uri: API + '/ISteamUserStats/GetUserStatsForGame/v0002/' + appid + '&appid=730&steamid=' + uSteamID,
					json: true
				}, function(error, response, body) {
					if (!error && response.statusCode === 200) {
						if (_.isEmpty(body) !== true) {
							var getStats = {};
							body.playerstats.stats.forEach(function (el) {
								getStats[el.name] = el.value;
							});
							var kills = getStats['total_kills'];
							var deaths = getStats['total_deaths'];
							var KDR = nanToZero((kills / deaths).toFixed(2));
							var playTime = moment.duration(getStats['total_time_played'], 'seconds').format('h [hrs] m [min]');
							var hits = getStats['total_shots_hit'];
							var shots = getStats['total_shots_fired'];
							var accuracy = nanToZero(((hits / shots) * 100).toFixed(2));
							var headShots = getStats['total_kills_headshot'];
							var headShotsPerc = nanToZero(((headShots / kills) * 100).toFixed(2));
							var MVP = getStats['total_mvps'];
							var battles = getStats['total_rounds_played'];
							var wins = getStats['total_wins'];
							var winRate = nanToZero(((wins / battles) * 100).toFixed(2));

							request({
								uri: API + '/ISteamUser/GetPlayerSummaries/v0002/' + appid + '&appid=730&steamids=' + uSteamID,
								json: true
							}, function(error, response, body) {
								var userName = body.response.players[0].personaname;
								chanoutput = '[' + c.bold(userName) + '] Played: ' + playTime + ' | Battles: ' +
									battles + ' [won: ' + wins + ' (' + winRate + '%) | Accuracy: ' + accuracy +
									'% | K/D: ' + KDR + ' [kills: ' + kills + ' - HeadShots: ' + headShots +
									' (' + headShotsPerc + '%)] | MVP: ' + MVP;
								bot.say(to, chanoutput);
							});
						} else {
							chanoutput = 'Maybe ' + c.bold(args[0]) + ' hasn\'t played CS:GO yet, or this profile is not public.';
						}
					} else {
						chanoutput = 'Something went wrong on the API server. Status code: ' + response.statusCode;
					}
					bot.say(to, chanoutput);
				});
				bot.say(to, chanoutput);
			});
		}
    },

    config: {
        triggers: ["csgo"],
        description: "CSGO Profile Statistics"
    }
}