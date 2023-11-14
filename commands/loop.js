import { SlashCommandBuilder } from 'discord.js'

export const command = new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Loops the current song or playlist')
    .addBooleanOption((option) =>
        option
            .setName('one')
            .setDescription('Whether to one song or the whole playlist!')
            .setRequired(true)
    )

command.slashRun = async function slashRun(client, interaction)
{
    const channel = interaction.channel
    const member = interaction.member
    const send = interaction.followUp.bind(interaction)
    const loopOne = interaction.options.getBoolean('one')

    await run(client, channel, member, send, loopOne)
}

command.prefixRun = async function prefixRun(client, message, parameters)
{
    const channel = message.channel
    const member = message.member
    const send = channel.send.bind(channel)
    const loopAll = parameters == "all"

    await run(client, channel, member, send, !loopAll)
}

async function run(client, channel, member, send, loopOne)
{
    const vcId = member.voice.channel?.id
    const guildId = channel.guild.id
    const botVcId = client.player.voices.get(guildId)?.channelId

    if (vcId !== botVcId)
        return send("You can't loop music if you aren't even in the voice channel.")

    const queue = client.player.getQueue(guildId)
    if (!queue || !queue.playing)
        return send('No music is currently playing.')

    const currentMode = queue.repeatMode
    if(currentMode !== 0)
    {
        queue.setRepeatMode(0)
        return send('Looping disabled.')
    }
    else
    {
        if(loopOne)
        {
            queue.setRepeatMode(1)
            return send('Looping the current song.')
        }
        else
        {
            queue.setRepeatMode(2)
            return send('Looping the whole playlist.')
        }
    }
}
