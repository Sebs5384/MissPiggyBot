import { SlashCommandBuilder } from 'discord.js'

export const command = new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffles the playlist')

command.slashRun = async function slashRun(client, interaction)
{
    const channel = interaction.channel
    const member = interaction.member
    const send = interaction.followUp.bind(interaction)

    await run(client, channel, member, send)
}

command.prefixRun = async function prefixRun(client, message, parameters)
{
    const channel = message.channel
    const member = message.member
    const send = channel.send.bind(channel)

    await run(client, channel, member, send)
}

async function run(client, channel, member, send)
{
    const vcId = member.voice.channel?.id
    const guildId = channel.guild.id
    const botVcId = client.player.voices.get(guildId)?.channelId

    if (vcId !== botVcId)
        return send("You can't shuffle the playlist if you aren't even in the voice channel.")

    const queue = client.player.getQueue(guildId)
    if (!queue || !queue.playing)
        return send('No music is currently playing.')

    await queue.shuffle();
    send("Shuffled the playlist.")
}
