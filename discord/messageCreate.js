import { Events } from 'discord.js'

export const event = Events.MessageCreate

export const callback = async function callback(client, message)
{
    if (message.author.bot || !message.guild || !message.id)
        return

    const botWasMentioned = message.mentions.has(client.user)
    const prefix = client.config.prefix
    const hasPrefix = message.content.startsWith(prefix)

    if (!(botWasMentioned || hasPrefix))
        return

    let contentWithoutPrefix = undefined
    if (hasPrefix)
        contentWithoutPrefix = message.content.substring(prefix.length)
    else if (botWasMentioned)
        contentWithoutPrefix = message.content.substring(`<@${client.user.id}>`.length)

    const tokens = contentWithoutPrefix.trim().split(' ')
    const commandName = tokens.shift()

    let command = client.commandAliases.get(commandName)
    if(!command)
        command = client.commands.get(commandName)

    if (!command || !('prefixRun' in command))
    {
        console.error(`No command matching ${commandName} was found.`)
        return
    }

    try 
    {
        await command.prefixRun(client, message, tokens.join(' '))
    }
    catch (e)
    {
        console.error(e)
    }
}
