import { Events } from 'distube'
import { userSongs } from '../commands/play'


export const event = Events.PLAY_SONG

export const callback = async function callback(client, queue, song)
{
    if(userSongs.length > 1) userSongs.shift()
    
    queue.textChannel.send(`🎵 Now playing: **${song.name}** 🎵` )
}
