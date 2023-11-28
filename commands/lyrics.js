import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js'
import { userSongs } from '../commands/play.js'
import Genius from 'genius-lyrics'

export const command = new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Asks Kermit to google for lyrics')

command.aliases = ['.l', '.lyric']

command.slashRun = async function slashRun(client, interaction) {
    const channel = interaction.channel
    const send = channel.send.bind(channel)
    const member = interaction.member

    await run(client, channel, send, member)
}

command.prefixRun = async function prefixRun(client, message) {
    const channel = message.channel
    const member = message.member
    const send = channel.send.bind(channel)

    await run(client, channel, send, member)
}

async function run(client, channel, send, member) {

    const lyricsToken = client.lyricsToken
    const geniusClient = new Genius.Client(lyricsToken)
    const guildId = channel.guild.id
    const queue =  client.player.getQueue(guildId)

    if (!queue || !queue.playing) return send('No music is currently playing.')

    let currentPage = 0
    const songList = await getSongList(geniusClient, userSongs, channel, queue)
    const songLyrics = await getLyrics(songList, send, currentPage)
    const lyricEmbed = await createLyricsEmbed(client, songLyrics, songList, currentPage)
    const lyricButtons = await createLyricsButtons(client, songList, currentPage)
    const message = await send({ embeds: [lyricEmbed], components: [lyricButtons] })
    
    handlePagination(client, message, member, songList, send, currentPage)
}

async function getSongList(lyrics, songs, channel, queue) {

    const userSongName = songs[0]
    const currentQueueSongName = queue.songs[0].name
    const similaritiesRate = await compareSongsName(userSongName, currentQueueSongName)
    const similaritiesThreshold = 0.1

    if( similaritiesRate >= similaritiesThreshold) {
        const userSongList = await lyrics.songs.search(userSongName)
        const queueSongList = await lyrics.songs.search(currentQueueSongName)

        return userSongList.length === 0 ? queueSongList : userSongList
    } else {
        const queueSongList =  await lyrics.songs.search(currentQueueSongName)
        
        return queueSongList
    }

}

async function getLyrics(songList, send, currentPage) {

    const firstSong = songList[currentPage]
    if (firstSong === undefined) return send('No lyrics found for this song')

    const currentSongLyrics = await firstSong.lyrics();

    return currentSongLyrics
}

async function compareSongsName(userSongName, queueSongName){
    const userSong = userSongName.split(' ')
    const queueSong = queueSongName.split(' ')
    const intersection = userSong.filter(songName => queueSong.includes(songName))
    const similaritiesValue = intersection.length / Math.max(userSong.length, queueSong.length)

    return similaritiesValue
}

async function handlePagination(client, message, member, songList, send, currentPage){
    const commandAuthorFilter = i => i.user.id === member.id

    const collector = message.createMessageComponentCollector({ commandAuthorFilter, time: 300000 })
    collector.on('collect', async (button) => {
        
        if(button.customId === 'back'){
            currentPage--
        } 
        else if(button.customId === 'forward'){
            currentPage++
        }

        const songLyrics = await getLyrics(songList, send, currentPage)
        const lyricEmbed = await createLyricsEmbed(client, songLyrics, songList, currentPage)
        const lyricButtons = await createLyricsButtons(client, songList, currentPage)

        message.edit({ embeds: [lyricEmbed], components: [lyricButtons] })
        await button.deferUpdate()
    })
}   

async function createLyricsEmbed(client, lyrics, songList, currentPage) {

    const currentPageLyrics = songList[currentPage]
    const MAX_DISCORD_MESSAGE_LENGTH = 4096

    console.log(lyrics.length)

    if (lyrics.length >= MAX_DISCORD_MESSAGE_LENGTH) 
    {
        return new EmbedBuilder()
        .setTitle(` ${currentPageLyrics.fullTitle}`)
        .setThumbnail(currentPageLyrics.thumbnail)
        .setDescription(`
            Ooops, it seems that the lyrics for this song are too long
            You can click in link below to see the full lyrics of this song 
            \n [Take me there !](${currentPageLyrics.url})`
        )
        .setColor('#ED4245')
        .setFooter({ text: `Found  ${currentPage + 1}/${songList.length} results for ${currentPageLyrics.title}` })
    }
    else 
    {
        return new EmbedBuilder()
            .setTitle(currentPageLyrics.fullTitle)
            .setURL(currentPageLyrics.url)
            .setThumbnail(currentPageLyrics.thumbnail)
            .setDescription(lyrics)
            .setColor(client.config.embedColor)
            .setFooter(
            { text: ` 
                \n Click on the title to get full information about this song \nFound  ${currentPage + 1}/${songList.length} results for ${currentPageLyrics.title}` 
            })
    }
}

async function createLyricsButtons(client, songList, currentPage){

    const currentSong = songList[currentPage]
    const firstPage = 0
    const lastPage = songList.length - 1

    if(currentSong === undefined) return

    const backButton =  new ButtonBuilder({
        style: ButtonStyle.Secondary,
        emoji: '◀',
        customId: 'back',
        disabled: currentPage === firstPage
    })

    const forwardButton =  new ButtonBuilder({
        style: ButtonStyle.Secondary,
        emoji: '▶',
        customId: 'forward',
        disabled: currentPage === lastPage
    })

    return new ActionRowBuilder({ components: [backButton, forwardButton] })
}

