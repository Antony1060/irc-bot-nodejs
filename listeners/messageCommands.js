const config = require('../config'),

	{ commands } = require("../globals");

module.exports = {
    /**
     * 
     * @param {import("irc-upd").Client} bot 
     */
    run(bot, nick, to, text) {
        if(!text.startsWith(config.botPrefix)) return

        // Removes the prefix from text, splits by all spaces, removes the first argument and assigns it to 'command'
        const args = text.slice(config.botPrefix.length).trim().split(/ +/g)
        const command = args.shift().toLowerCase()

        const cmd = commands.get(command)

        if(cmd) cmd.run(bot, nick, to, text, args)
    },

    config: {
        type: "message"
    }
}