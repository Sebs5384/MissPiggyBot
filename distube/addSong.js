import { Events } from 'distube'

export const event = Events.ADD_SONG

export const callback = async function callback(client, queue, song)
{
    queue.textChannel.send(`**${song.name}** added to queue.`)
}
