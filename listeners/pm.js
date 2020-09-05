module.exports = {
    /**
     * 
     * @param {import("irc-upd").Client} bot 
     */
    run(bot, nick) {
        bot.say(nick, 'Type !help for a list of commands');
    },

    config: {
        type: "pm"
    }
}