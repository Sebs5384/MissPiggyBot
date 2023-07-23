import { Events } from 'distube'

export const event = Events.PLAY_SONG

export const callback = async function callback(client, queue, song)
{
    queue.textChannel.send(`🎵 Now playing: **${song.name}** 🎵` )
}
