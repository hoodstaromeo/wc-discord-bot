import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to ban").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the ban").setRequired(false)
    )
    .addIntegerOption((opt) =>
      opt
        .setName("delete_days")
        .setDescription("Days of messages to delete (0–7)")
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const deleteDays = interaction.options.getInteger("delete_days") ?? 0;

    if (!target) {
      return interaction.reply({ content: "Could not find that user.", ephemeral: true });
    }

    await interaction.guild.members.ban(target, {
      reason,
      deleteMessageSeconds: deleteDays * 86400,
    });

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle("Member Banned")
      .addFields(
        { name: "User", value: `${target.tag}`, inline: true },
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
