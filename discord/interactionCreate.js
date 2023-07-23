import { Events } from 'discord.js'

export const event = Events.InteractionCreate

export const callback = async function callback(client, interaction)
{
    if (!interaction.isChatInputCommand())
        return

    const command = client.commands.get(interaction.commandName)
    if (!command || !('slashRun' in command))
    {
        console.error(`No command matching ${interaction.commandName} was found.`)
        return
    }

    try 
    {
        await interaction.deferReply()
        await command.slashRun(client, interaction)
    }
    catch (e)
    {
        console.error(e)
    }
}
