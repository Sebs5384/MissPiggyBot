import { Events } from 'distube'

export const event = Events.PLAY_SONG

export const callback = async function callback(client, queue, song)
{
    if(queue.userSongs && queue.userSongs.length >= 2) {
       queue.userSongs.shift()
    }

    queue.textChannel.send(`🎵 Now playing: **${song.name}** 🎵` )
}
