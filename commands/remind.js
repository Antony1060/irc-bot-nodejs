const ontime = require('ontime');

module.exports = {
    /**
     * 
     * @param {import("irc-upd").Client} bot 
     */
    run(bot, nick, to, text, args) {
        if (!args[1] || !args[2]) {
			bot.say(to, 'Missing TIME and TEXT. For example: !remind 14:30 Check pizza in oven');
		} else {
			var timeToRemind = args[1];
			var currentdate = new Date();
			var currMinutes = currentdate.getMinutes();
			if (currMinutes < 10) {
				currMinutes = '0' + currMinutes;
			}
			var currentTime = currentdate.getHours() + ':' + currMinutes;
			if (timeToRemind < currentTime) {
				bot.say(to, 'Current time: ' + currentTime +
						' is earlier then your set time, reminder is set for tomorrow.');
			}
			args.splice(0, 2);
			ontime({
				cycle: timeToRemind + ':00'
			}, function (ot) {
				bot.say(to, 'Hey ' + nick + ' , don\'t forget: ' + args.join(' '));
				ot.done();
				ot.cancel();
				return;
			});
			bot.say(to, 'Reminder set for ' + nick + '. At ' + timeToRemind + ' with: ' + args.join(' '));
		}
    },

    config: {
        triggers: ["remind"],
        description: "Remind yourself"
    }
}