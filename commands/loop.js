import { SlashCommandBuilder } from 'discord.js'

export const command = new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Loops the current song or playlist')
    .addStringOption((option) =>
        option
            .setName('choice')
            .setDescription('Whether to one song or the whole playlist!')
            .setRequired(true)
            .addChoices(
				{ name: 'Song', value: 'song' },
				{ name: 'Playlist', value: 'playlist' },
				{ name: 'Stop', value: 'stop' },
			))

command.slashRun = async function slashRun(client, interaction)
{
    const channel = interaction.channel
    const member = interaction.member
    const send = interaction.followUp.bind(interaction)
    const choice = interaction.options.getString('choice')

    await run(client, channel, member, send, choice)
}

command.prefixRun = async function prefixRun(client, message, parameters)
{
    const channel = message.channel
    const member = message.member
    const send = channel.send.bind(channel)

    await run(client, channel, member, send, parameters)
}

async function run(client, channel, member, send, choice)
{
    const vcId = member.voice.channel?.id
    const guildId = channel.guild.id
    const botVcId = client.player.voices.get(guildId)?.channelId

    if (vcId !== botVcId)
        return send("You can't loop music if you aren't even in the voice channel.")

    const queue = client.player.getQueue(guildId)
    if (!queue || !queue.playing)
        return send('No music is currently playing.')
    
    if (choice == 'stop')
    {
        queue.setRepeatMode(0)
        return send('Looping disabled.')
    }
    else if(choice == 'song')
    {
        queue.setRepeatMode(1)
        return send('Looping the current song.')
    }
    else if (choice == 'playlist')
    {
        queue.setRepeatMode(2)
        return send('Looping the whole playlist.')
    }
    else 
    {
        return send(`'${choice}' is not a valid option.`)
    }
}
