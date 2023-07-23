import { ActivityType, Events, REST, Routes } from 'discord.js'

export const event = Events.ClientReady

export const callback = async function callback(client)
{
    // Register slash commands
    (async () =>
    {
        try 
        {
            const rest = new REST().setToken(client.config.token)
            console.log(`Started refreshing application slash commands.`)
            await rest.put(Routes.applicationCommands(client.user.id), {
                body: await client.commands,
            })
            console.log(`Successfully reloaded ${client.commands.size} application [/] commands.`)
        }
        catch (err) 
        {
            console.log("Error reloading application [/] commands: " + err)
        }
    })()

    console.log(`Ready! Logged in as ${client.user.tag}`)
    client.user.setActivity({ name: '🎶', type: ActivityType.Listening })
}