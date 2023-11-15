import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import Genius from 'genius-lyrics'
import config from '../config.json' assert {type: 'json'}

export const command = new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Asks Kermit to google for lyrics')

command.aliases = ['.l', '.lyric']

command.slashRun = async function slashRun(client, interaction)
{
    await interaction.followUp({ content: 'Lets ask Kermit!', ephemeral: true });

    const channel = interaction.channel
    const send = channel.send.bind(channel)

    await run(client, channel, send)
}

command.prefixRun = async function prefixRun(client, message, parameters)
{
    const channel = message.channel
    const send = channel.send.bind(channel)
    const lyricsToken = config.lyricsToken

    await run(client, channel, send, lyricsToken)
}

async function run(client, channel, send, lyricsToken)
{
    const guildId = channel.guild.id
    const queue = client.player.getQueue(guildId)
    if(!queue || !queue.playing)
    {
        return send('No music is currently playing.')
    }

    const currentSong = queue.songs[0]
    const songList = await getSong(lyricsToken, currentSong)
    const lyrics = await getLyrics(songList, send)

    const embed = createLyricsEmbed(client, lyrics, songList[0])
    
    embed ? await send({ embeds: [embed] })

}

function createLyricsEmbed(client, lyrics, song)
{
    if(song === undefined)
    {   
        return console.log('No song found')
    } 
    else 
    {
        return new EmbedBuilder()
        .setTitle(song.fullTitle)
        .setURL(song.url)
        .setThumbnail(song.thumbnail)   
        .setDescription(lyrics)
        .setColor(client.config.embedColor)
        .setFooter({ text: 'Click on the title to get full information about this song'})
    }

 
}

async function getSong(token, currentSong)
{   
    const currentSongName = currentSong.name
    const geniusClient = new Genius.Client(token)
    const song = await geniusClient.songs.search(currentSongName)

    return song
}

async function getLyrics(song, send)
{
    const currentSong = song[0] 
    
    if(currentSong === undefined) return send('No lyrics found for this song')
    
    const currentSongLyrics = await currentSong.lyrics();
    const songName = song.fullTitle

    if(song.fullTitle === undefined){

    } return send(`No lyrics found for ${song.fullTitle}`) 

    return currentSongLyrics
}
