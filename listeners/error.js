module.exports = {
    /**
     * 
     * @param {import("irc-upd").Client} bot 
     */
    run(bot, message) {
        console.error('error: ', message);
    },

    config: {
        type: "pm"
    }
}