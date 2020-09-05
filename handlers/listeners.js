const { listeners } = require("../globals")
const util = require("../util/util")
const { handleDirectory } = require("./command")

/**
 * 
 * @param {import("irc-upd").Client} bot 
 */
module.exports = async (bot) => {
    const listenerFiles = await handleDirectory("./listeners")

    for(let file of listenerFiles) {
        const listener = require(`.${file}`)
        
        if(!listener.config || !util.dataContainsAll(listener.config, "type")) {
            console.log(`Failed to load listener at ${file}`)
            continue
        }

        listeners.set(listener.config.type.toLowerCase(), listener)

        bot.addListener(listener.config.type, (...args) => {
            listener.run(bot, ...args)
        })

        console.log(`Loaded listener at ${file}`)
    }
}