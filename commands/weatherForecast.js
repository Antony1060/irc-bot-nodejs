const config = require('../config'),

// node modules defined in package.json

	moment = require('moment'),
	request = require('request')

module.exports = {
    /**
     * 
     * @param {import("irc-upd").Client} bot 
     */
    run(bot, nick, to, text, args) {
        if (!args[1]) {
			bot.say(to, 'Missing arguments. Usage example: !weather Moscow; !weather zip 10000,hr');
		} else {
			var forecastWeather = 'http://api.openweathermap.org/data/2.5/forecast?';
			var metricAndMode = '&units=metric&mode=json';
			var apiKeyOW = '&APPID=' + config.OWapiKey;
			var userQuery;
			args.shift();

			// check if user wants to search by ZIP code or by city name
			if (args[0] === 'zip') {
				userQuery = 'zip=' + args[1];
			} else {
				args = args.join('');
				userQuery = 'q=' + args;
			}
			userQuery += metricAndMode + apiKeyOW;
			var owLink = forecastWeather + userQuery;

			request(owLink, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					var openweatherJson = JSON.parse(body);
					if (openweatherJson.cod === '404') {
						console.error('error while trying to get weather, "cod" code: ', openweatherJson.cod);
						bot.say(to, 'Sorry, no weather info for that one.');
					} else if (openweatherJson.cod === '200') {
						var i = 0;
						for (i = 0; i < openweatherJson.cnt; i++) {
							if (openweatherJson.list[i].dt_txt.search('15:00:00') >= 0) {
								break;
							}
						}

						var openweatherSummary = '';

						for (i; i < openweatherJson.cnt; i += 8) {
							var day = moment(openweatherJson.list[i].dt_txt);
							openweatherSummary += moment().day(day.day()).format('dddd') + ': ' + openweatherJson.list[i].main.temp +
												' C, ' + openweatherJson.list[i].weather[0].description +
												', ' + openweatherJson.list[i].main.pressure +
												' hpa, ' + openweatherJson.list[i].wind.speed +
												' km/h, ' + openweatherJson.list[i].main.humidity + ' % \n';
						}

						bot.say(to, openweatherSummary);
					} else {
						console.error('error while trying to get weather forecast for: ', owLink);
						bot.say(to, 'Sorry, no weather forecast info for that one.');
					}
				}
			});
		}
    },

    config: {
        triggers: ["weatherforecast", "wf"],
        description: "View weather forecast"
    }
}