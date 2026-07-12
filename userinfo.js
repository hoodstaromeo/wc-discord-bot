import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member (mute them temporarily)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to timeout").setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt
        .setName("minutes")
        .setDescription("Duration in minutes (1–40320)")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the timeout").setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember("user");
    const minutes = interaction.options.getInteger("minutes", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!target) {
      return interaction.reply({ content: "Could not find that member.", ephemeral: true });
    }

    await target.timeout(minutes * 60 * 1000, reason);

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle("Member Timed Out")
      .addFields(
        { name: "User", value: `${target.user.tag}`, inline: true },
        { name: "Duration", value: `${minutes} minute(s)`, inline: true },
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
