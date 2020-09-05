const google = require('google');

module.exports = {
    /**
     * 
     * @param {import("irc-upd").Client} bot 
     */
    run(bot, nick, to, text, args) {
        if (!args[0]) {
			bot.say(to, 'Missing arguments. Usage example: !g Terry Pratchett');
		} else {
			args = args.join(' ');
			google(args, function (err, res) {
				if (err) {
                    console.error(err);
                    return
                }
                console.log(res);
                
                if(!res.links[0]) {
                    bot.say(to, "There was an error performing that command.")
                    return
                }

                bot.say(to, res.links[0].title + ' | ' + res.links[0].description + ' | ' + res.links[0].href);
			});
		}
    },

    config: {
        triggers: ["google", "g"],
        description: "Google search results"
    }
}