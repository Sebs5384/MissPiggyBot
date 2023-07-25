import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageCollector, SlashCommandBuilder } from 'discord.js'

export const command = new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Shows the current songs in the playlist.')

command.aliases = ['pl', 'queue', 'q']

command.slashRun = async function slashRun(client, interaction)
{
    const channel = interaction.channel
    const member = interaction.member
    const send = interaction.followUp.bind(interaction)

    await run(client, channel, member, send)
}

command.prefixRun = async function prefixRun(client, message, parameters)
{
    const channel = message.channel
    const member = message.member
    const send = channel.send.bind(channel)

    await run(client, channel, member, send)
}

async function run(client, channel, member, send)
{
    const guildId = channel.guild.id
    const queue = client.player.getQueue(guildId)
    if (!queue)
        return send('No music is currently playing.')

    if (queue.songs.length == 0)
        return send('The playlist is empty.')

    const playlist = queue.songs.map(song =>
    {
        return {
            title: song.name,
            user: song.user,
            url: song.url,
            duration: song.formattedDuration
        }
    })
    
    let currentPage = 0
    const embed = createPlaylistEmbed(playlist, currentPage, channel.guild, client)
    const buttons = createPlaylistButtons(playlist, currentPage)
    const message = await send({ embeds: [embed], components: [buttons] })

    const commandAuthorFilter = i => i.user.id === member.id
    const collector = message.createMessageComponentCollector({ commandAuthorFilter, time: 300000 })
    collector.on('collect', async (button) =>
    {
        if (button.customId === 'back')
        {
            currentPage--
        }
        else if (button.customId === 'forward')
        {
            currentPage++
        }

        const embed = createPlaylistEmbed(playlist, currentPage, channel.guild, client)
        const buttons = createPlaylistButtons(playlist, currentPage)

        message.edit({ embeds: [embed], components: [buttons] })
        await button.deferUpdate()
    })
}

function createPlaylistEmbed(playlist, page, guild, client)
{
    let songsPerPage = 10
    let totalPages = Math.floor(playlist.length / songsPerPage)
    let firstOnPage = page * songsPerPage
    let lastOnPage = firstOnPage + songsPerPage

    const songs = playlist.slice(firstOnPage, lastOnPage)

    const songTitles = songs.map(song =>
    {
        if (firstOnPage == 0)
        {
            const queue = client.player.getQueue(guild.id)
            return `**Current time: ${queue.formattedCurrentTime} / ${song.duration} \n**${1 + firstOnPage++}: [${song.title}](${song.url}) by <@${song.user.id}>\n`
        }
        else
        {
            return `**${1 + firstOnPage++}**: [${song.title}](${song.url}) \`${song.duration}\` by <@${song.user.id}>`
        }
    })

    return new EmbedBuilder()
        .setTitle('Playlist')
        .setThumbnail(guild.iconURL({ size: 2048, dynamic: true }))
        .setColor(client.config.embedColor)
        .setDescription(songTitles.join('\n'))
        .setFooter({ text: `Page ${page + 1}/${totalPages + 1}` })
}

function createPlaylistButtons(playlist, page)
{
    let songsPerPage = 10
    let firstOnPage = page * songsPerPage
    let lastOnPage = firstOnPage + songsPerPage

    const backButton = new ButtonBuilder({
        style: ButtonStyle.Secondary,
        emoji: '◀',
        customId: 'back',
        disabled: page == 0
    })

    const forwardButton = new ButtonBuilder({
        style: ButtonStyle.Secondary,
        emoji: '▶',
        customId: 'forward',
        disabled: (lastOnPage >= playlist.length)
    })

    return new ActionRowBuilder({ components: [backButton, forwardButton] })
}
