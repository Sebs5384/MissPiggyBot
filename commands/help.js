import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

export const command = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Lists all available commands')

command.aliases = ['h']

command.slashRun = async function slashRun(client, interaction)
{
    const send = interaction.followUp.bind(interaction)

    await run(client, send)
}

command.prefixRun = async function prefixRun(client, message, parameters)
{
    const channel = message.channel
    const send = channel.send.bind(channel)

    await run(client, send)
}

async function run(client, send)
{
    const commands = client.commands

    const fields = []
    commands.each(command => fields.push({ name: `/${command.name}`, value: command.description }))

    const embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setTitle("/help <command>")
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(fields)

    return send({ embeds: [embed] })
}
