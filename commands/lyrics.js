import { SlashCommandBuilder } from 'discord.js'

export const command = new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Asks Kermit to google for lyrics')

command.aliases = ['l', 'lyric']

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
    
    await channel.send('Lets ask Kermit!')

    await run(client, channel, send)
}

async function run(client, channel, send)
{
    const guildId = channel.guild.id

    const queue = client.player.getQueue(guildId)
    if (!queue || !queue.playing)
        return send('Oh wait, there is no music playing.')

    let song = queue.songs[0];
    send(`k.g www.genius.com lyrics ${song.name}`)
}
