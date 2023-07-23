import fs from 'node:fs'
import { ActivityType, Client, Collection, Events, GatewayIntentBits, Partials, REST, Routes } from 'discord.js'
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
    const { command } = await import(`#commands/${file}`);
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

client.on(Events.MessageCreate, async message =>
{
    if (message.author.bot || !message.guild || !message.id)
        return;

    const mentionedUser = message.mentions.users.first()
    const botWasMentioned = message.content.startsWith(`<@${mentionedUser?.id}>`)
    const prefix = client.config.prefix
    const hasPrefix = message.content.startsWith(prefix)

    if (!(botWasMentioned || hasPrefix))
        return

    let contentWithoutPrefix = undefined
    if (hasPrefix)
        contentWithoutPrefix = message.content.substring(prefix.length)
    else if (botWasMentioned)
        contentWithoutPrefix = message.content.substring(`<@${mentionedUser.id}>`.length)

    const tokens = contentWithoutPrefix.trim().split(' ')
    const commandName = tokens.shift();

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
})

client.on(Events.InteractionCreate, async interaction =>
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
})

client.once(Events.ClientReady, c =>
{
    // Register slash commands
    (async () =>
    {
        try 
        {
            const rest = new REST().setToken(client.config.token);
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

    console.log(`Ready! Logged in as ${c.user.tag}`)
    client.user.setActivity({ name: '🎶', type: ActivityType.Listening })
})

client.login(client.config.token)
