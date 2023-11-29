import { Events } from 'distube'

export const event = Events.PLAY_SONG

export const callback = async function callback(client, queue, song)
{
    if(queue.userSongs) {
        queue.userSongs.length > 1 ? queue.userSongs.shift() : null
    }

    queue.textChannel.send(`🎵 Now playing: **${song.name}** 🎵` )
}
