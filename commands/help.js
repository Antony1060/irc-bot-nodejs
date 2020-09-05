
module.exports = {
    /**
     * 
     * @param {import("irc-upd").Client} bot 
     */
    run(bot, nick, to, text, args) {
        bot.say(nick, 'Commands available:\n!wp - Wikipedia summary\n!weather or !w - current weather\n' +
        '!tv, !next, !last - for TV show info\n!isup - check if a website is up\n' +
        '!csgo - CSGO Profile statistic\n!help\n' +
        '\nBot grabs titles for the following links posted in the channel:\n' +
        'imgur, youtube, twitter, github, soundcloud');
    },

    config: {
        triggers: ["help", "?"],
        description: "View all commands"
    }
}