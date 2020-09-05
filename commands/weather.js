const config = require('../config'),

// node modules defined in package.json

	moment = require('moment'),
	request = require('request');

module.exports = {
    /**
     * 
     * @param {import("irc-upd").Client} bot 
     */
    run(bot, nick, to, text, args) {
        if (!args[1]) {
			bot.say(to, 'Missing arguments. Usage example: !weather Moscow; !weather zip 10000,hr');
		} else {
			var currentWeather = 'http://api.openweathermap.org/data/2.5/weather?';
			var metric = '&units=metric';
			var apiKey = '&APPID=' + config.OWapiKey;
			var userInput;
			args.shift();

			// check if user wants to search by ZIP code or by city name
			if (args[0] === 'zip') {
				userInput = 'zip=' + args[1];
			} else {
				args = args.join('');
				userInput = 'q=' + args;
			}
			userInput += metric + apiKey;
			var openweatherLink = currentWeather + userInput;

			request(openweatherLink, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					var openweatherJson = JSON.parse(body);
					if (openweatherJson.cod === '404') {
						console.error('error while trying to get weather, "cod" code: ', openweatherJson.cod);
						bot.say(to, 'Sorry, no weather info for that one.');
					} else if (openweatherJson.cod === 200) {

						var openweatherSummary = 'The current temperature in ' + openweatherJson.name +
												', ' + openweatherJson.sys.country + ' is: ' + openweatherJson.main.temp.toFixed(1) +
												' C, ' + openweatherJson.weather[0].description +
												'. Pressure: ' + openweatherJson.main.pressure +
												' hpa. Wind speed: ' + openweatherJson.wind.speed + ' m/s (' + (openweatherJson.wind.speed * 3.6).toFixed(2) +
												' km/h). Humidity: ' + openweatherJson.main.humidity +
												' %. Local Time: ' + moment.unix(parseInt(moment().format('X'), 10) + parseInt(openweatherJson.timezone, 10)).format('dddd, MMMM Do YYYY, HH:mm:ss') +
												' h. Sunrise: ' + moment.unix(openweatherJson.sys.sunrise + parseInt(openweatherJson.timezone, 10)).format('HH:mm:ss') +
												' h, sunset: ' + moment.unix(openweatherJson.sys.sunset + parseInt(openweatherJson.timezone, 10)).format('HH:mm:ss') + ' h.';

						bot.say(to, openweatherSummary);
					} else {
						console.error('error while trying to get weather for: ', openweatherLink);
						bot.say(to, 'Sorry, no weather info for that one.');
					}
				}
			});
		}	
    },

    config: {
        triggers: ["weather", "w"],
        description: "View current weather"
    }
}