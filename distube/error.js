import { Events } from 'distube'

export const event = Events.ERROR

export const callback = async function callback(client, textChannel, e)
{
    if (textChannel) {
        return textChannel?.send(`**An error occurred:** ${e.toString().slice(0, 1974)}`)
    }
    console.log(e)
}
