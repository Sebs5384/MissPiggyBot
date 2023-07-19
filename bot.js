import fs from 'node:fs'
import { ActivityType, Client, Collection, Events, GatewayIntentBits, Partials, REST, Routes } from 'discord.js'
import { DisTube } from 'distube'
import { SpotifyPlugin } from '@distube/spotify'
import { SoundCloudPlugin } from '@distube/soundcloud'
import { YtDlpPlugin } from '@distube/yt-dlp'
import config from './config.json' assert {type: 'json'}

const client = new Client({
    partials: [
        Partials.Channel, // for text channel
        Partials.GuildMember, // for guild member
        Partials.User, // for discord user
    ],
    intents: [
        GatewayIntentBits.Guilds, // for guild related things
        GatewayIntentBits.GuildMembers, // for guild members related things
        GatewayIntentBits.GuildIntegrations, // for discord Integrations
        GatewayIntentBits.GuildVoiceStates, // for voice related things
        GatewayIntentBits.GuildMessages
    ]
})
client.config = config

client.player = new DisTube(client, {
    leaveOnStop: false,
    leaveOnFinish: false,
    emitNewSongOnly: true,
    plugins: [
        new SpotifyPlugin(),
        new SoundCloudPlugin(),
        new YtDlpPlugin()
    ]
})

client.commands = new Collection()
const commandsPath = './commands'
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
for (const file of commandFiles)
{
    const { command } = await import(`#commands/${file}`);
    if ('name' in command && 'slashRun' in command)
    {
        client.commands.set(command.name, command)
    }
    else
    {
        console.log(`[WARNING] The command ${file} in ${commandsPath} is missing a required "name" or "slashRun" property.`)
    }
}

client.on(Events.InteractionCreate, async interaction =>
{
    if (!interaction.isChatInputCommand())
        return

    const command = client.commands.get(interaction.commandName)

    if (!command)
    {
        console.error(`No command matching ${interaction.commandName} was found.`)
        return
    }

    try 
    {
        await command.slashRun(client, interaction)
    }
    catch (e)
    {
        console.error(e)
    }
})

client.once(Events.ClientReady, c =>
{
    // Register slash commands
    (async () =>
    {
        try 
        {
            const rest = new REST().setToken(client.config.token);
            console.log(`Started refreshing ${client.commands.size} application [/] commands.`)
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

    console.log(`Ready! Logged in as ${c.user.tag}`)
    client.user.setActivity({ name: '🎶', type: ActivityType.Listening })
})

client.login(client.config.token)
