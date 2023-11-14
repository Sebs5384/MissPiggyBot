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

async function getSongList(token, song)
{   
    const geniusClient = new Genius.Client(token)
    const songList = await geniusClient.songs.search("Monument a day to remember")
    
    if(songList.length == 0)
    {
        return 'No songs found'
    } else 
    {
        songList.map((song) => {
            console.log(song.fullTitle)
        })

        return songList[0]
    }

}

async function getLyrics(song)
{
    const lyrics = song.lyrics();

    if(!lyrics)
    {
        return 'No lyrics found'
    } else
    {
        return lyrics
    } 
}

async function run(client, channel, send, lyricsToken)
{
    

    const songList = await getSongList(lyricsToken)
    const lyrics = await getLyrics(songList)

    const embed = createLyricsEmbed(client, lyrics, songList)
    
    await send({ embeds: [embed] })

}

function createLyricsEmbed(client, lyrics, song)
{

    return new EmbedBuilder()
        .setTitle(song.fullTitle)
        .setURL(song.url)
        .setThumbnail(song.thumbnail)   
        .setAuthor({ name: 'Kermit', iconURL: 'https://cdn.discordapp.com/emojis/1008301553006685450.png' })
        .setDescription(lyrics)
        .setColor(client.config.embedColor)
}


