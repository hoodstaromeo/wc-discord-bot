import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Send a warning to a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to warn").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the warning").setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);

    // DM the user
    await target
      .send(
        `⚠️ You have been warned in **${interaction.guild?.name}**.\n**Reason:** ${reason}`
      )
      .catch(() => null);

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("Member Warned")
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
