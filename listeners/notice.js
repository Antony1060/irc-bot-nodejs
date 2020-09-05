const config = require('../config');

module.exports = {
    /**
     * 
     * @param {import("irc-upd").Client} bot 
     */
    run(bot, nick, to, text, message) {
        if (message.args[1].match(/This nickname is registered/g) !== null) {
            bot.say('NickServ', 'identify ' + config.nickservPassword);
        }
        if (message.args[1].match(/Password accepted - you are now recognized./g) !== null) {
            bot.join(bot.opt.channels.join(','));
        }
    },

    config: {
        type: "pm"
    }
}