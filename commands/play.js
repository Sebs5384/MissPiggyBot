import { SlashCommandBuilder } from 'discord.js'

export const command = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song with a link or name')
    .addStringOption((option) =>
        option
            .setName('name')
            .setDescription('Song name or link. Playlist links also work!')
            .setRequired(true)
    )

command.aliases = ['p']

command.slashRun = async function slashRun(client, interaction)
{
    const nameValue = interaction.options.getString('name')
    if (!nameValue)
        return interaction.followUp('You forgot to add the name or link to a song or playlist')

    const channel = interaction.channel
    const member = interaction.member
    const send = interaction.followUp.bind(interaction)

    await run(client, channel, member, send, nameValue)
}

command.prefixRun = async function prefixRun(client, message, parameters)
{
    if (parameters.length == 0)
        return message.channel.send('You forgot to add the name or link to a song or playlist')

    const channel = message.channel
    const member = message.member
    const send = channel.send.bind(channel)

    await run(client, channel, member, send, parameters)
}

async function run(client, channel, member, send, songNameOrUrl)
{
    const vc = member.voice.channel
    if (!vc)
    {
        return send('You need to be in a voice channel!')
    }

    await send('Trying to load music... 🎧')

    try
    {
        await client.player.play(vc, songNameOrUrl, {
            member: member,
            textChannel: channel,
            songNameOrUrl
        })

        let queue = client.player.getQueue(channel.guildId)
        if (!queue.autoplay)
            queue.toggleAutoplay()
    }
    catch (e)
    {
        await channel.send('Sorry, no results found!')
    }
}
