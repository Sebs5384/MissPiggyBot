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

    await run(client, channel, send)
}

command.prefixRun = async function prefixRun(client, message) {
    const channel = message.channel
    const send = channel.send.bind(channel)

    await run(client, channel, send)
}

async function run(client, channel, send) {

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

    await send({ embeds: [lyricEmbed], components: [lyricButtons] })


}

async function handlePagination(client, channel, send, songList, currentPage){

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

async function createLyricsEmbed(client, lyrics, songList, currentPage) {

    const currentPageLyrics = songList[currentPage]
    
    if (currentPageLyrics === undefined) {
        return console.log('No song found')
    }
    else {
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
    if(currentSong === undefined) return

    const backButton =  new ButtonBuilder({
        style: ButtonStyle.Secondary,
        emoji: '◀',
        customId: 'back',
        disabled: currentPage === 0
    })

    const forwardButton =  new ButtonBuilder({
        style: ButtonStyle.Secondary,
        emoji: '▶',
        customId: 'forward',
        disabled: currentPage === songList.length
    })

    return new ActionRowBuilder({ components: [backButton, forwardButton] })
}

