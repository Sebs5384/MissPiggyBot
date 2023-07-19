import { SlashCommandBuilder } from 'discord.js';

export const command = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song with a link or name')
    .addStringOption((option) =>
        option
            .setName('name')
            .setDescription('Song name or link. Playlist links also work!')
            .setRequired(true)
    )

command.slashRun = async function slashRun(client, interaction)
{
    const nameValue = interaction.options.getString('name')
    if (!nameValue)
        return interaction.reply({ content: "You forgot to add the name or link to a song or playlist" })

    let channel = interaction.channel
    let member = interaction.member

    await run(client, channel, member, nameValue)
}

async function run(client, channel, member, songNameOrUrl)
{
    const vc = member.voice.channel
    try
    {
        await client.player.play(vc, songNameOrUrl, {
            member: member,
            textChannel: channel,
            songNameOrUrl
        })
    }
    catch (e)
    {
        await channel.send({ content: "No results found!" })
    }
}
