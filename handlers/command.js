const fs = require("fs").promises;
const { commands } = require("../globals")
const util = require("../util/util")

module.exports = async () => {
    const commandFiles = await handleDirectory("./commands")

    for(let file of commandFiles) {
        const command = require(`.${file}`)
        
        if(!command.config || !util.dataContainsAll(command.config, "triggers", "description")) {
            console.log(`Failed to load command at ${file}`)
            continue
        }

        for(let trigger of command.config.triggers) commands.set(trigger.toLowerCase(), command)
        console.log(`Loaded command at ${file}`)
    }
}

/**
 * 
 * @param {string} fullPath
 * @returns {Array<string>} 
 */
async function handleDirectory(fullPath) {
    let toReturn = []

    await fs.readdir(fullPath).then(async files => {
        for(let file of files) {
            const stat = await fs.stat(`${fullPath}/${file}`)
            if(stat.isDirectory()) {
                toReturn = toReturn.concat(await handleDirectory(`${fullPath}/${file}`))
            } else if(file.endsWith(".js")) {
                toReturn.push(`${fullPath}/${file}`)
            }
        }
    }).catch(err => {
        console.error(err)
    })

    return toReturn
}

module.exports.handleDirectory = handleDirectory;