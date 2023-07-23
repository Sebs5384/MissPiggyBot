import fs from 'node:fs'
import { Client, Collection, Events, GatewayIntentBits, Partials } from 'discord.js'
import { DisTube } from 'distube'
import { SpotifyPlugin } from '@distube/spotify'
import { SoundCloudPlugin } from '@distube/soundcloud'
import { YtDlpPlugin } from '@distube/yt-dlp'
import config from './config.json' assert {type: 'json'}

const client = new Client({
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.User,
    ],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
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
client.commandAliases = new Collection()
const commandsPath = './commands'
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
for (const file of commandFiles)
{
    const { command } = await import(`#commands/${file}`)
    if ('name' in command)
    {
        const isSlashCommand = 'slashRun' in command
        const isPrefixCommand = 'prefixRun' in command

        if (!(isSlashCommand || isPrefixCommand))
        {
            console.log(`[WARNING] The command ${file} in ${commandsPath} is missing a required "slashRun" or "prefixRun" property.`)
            continue
        }

        client.commands.set(command.name, command)

        if (command.aliases)
        {
            for (const alias of command.aliases)
            {
                client.commandAliases.set(alias, command)
            }
        }

        console.log(`The command "${command.name}" was added: [Slash: ${isSlashCommand}], [Prefix: ${isPrefixCommand}], [Aliases: ${command.aliases}]`)
    }
    else
    {
        console.log(`[WARNING] The command ${file} in ${commandsPath} is missing a required "name" property.`)
    }
}

const discordEventsPath = './discord'
const discordEventFiles = fs.readdirSync(discordEventsPath).filter(file => file.endsWith('.js'))
for (const file of discordEventFiles)
{
    const { event, callback } = await import(`#discord/${file}`)
    client.on(event, callback.bind(null, client))
}

const distubeEventsPath = './distube'
const distubeEventFiles = fs.readdirSync(distubeEventsPath).filter(file => file.endsWith('.js'))
for (const file of distubeEventFiles)
{
    const { event, callback } = await import(`#distube/${file}`)
    client.player.on(event, callback.bind(null, client))
}

client.login(client.config.token)
