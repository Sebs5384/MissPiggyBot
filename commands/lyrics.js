import { SlashCommandBuilder } from 'discord.js'

export const command = new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Asks Kermit to google for lyrics')

command.aliases = ['l', 'lyric']

command.slashRun = async function slashRun(client, interaction)
{
    const channel = interaction.channel
    const send = interaction.followUp.bind(interaction)

    await run(client, channel, send)
}

command.prefixRun = async function prefixRun(client, message, parameters)
{
    const channel = message.channel
    const send = channel.send.bind(channel)

    await run(client, channel, send)
}

async function run(client, channel, send)
{
    const guildId = channel.guild.id

    const queue = client.player.getQueue(guildId)
    if (!queue || !queue.playing)
        return send('No music is currently playing.')

    let song = queue.songs[0];
    send(`k.g www.genius.com lyrics ${song.name}`)
}
