import { Events } from 'distube'

export const event = Events.ADD_LIST

export const callback = async function callback(client, queue, playlist)
{
    queue.textChannel.send(`\`${playlist.name} (${playlist.songs.length} songs)\` songs added to the playlist.`)
}
