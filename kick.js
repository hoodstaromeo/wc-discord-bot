import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to kick").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the kick").setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) {
      return interaction.reply({ content: "Could not find that member.", ephemeral: true });
    }

    await target.kick(reason);

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle("Member Kicked")
      .addFields(
        { name: "User", value: `${target.user.tag}`, inline: true },
        { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    await sendLog(interaction, embed);
  },
};

async function sendLog(interaction, embed) {
  const logChannelId = process.env.DISCORD_LOG_CHANNEL_ID;
  if (!logChannelId) return;
  const logChannel = interaction.guild?.channels.cache.get(logChannelId);
  if (logChannel?.isTextBased()) await logChannel.send({ embeds: [embed] }).catch(() => null);
}
