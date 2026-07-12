import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Bulk delete messages from this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((opt) =>
      opt
        .setName("amount")
        .setDescription("Number of messages to delete (1–100)")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount", true);
    const channel = interaction.channel;

    if (!channel?.isTextBased()) {
      return interaction.reply({
        content: "This command can only be used in text channels.",
        ephemeral: true,
      });
    }

    const deleted = await channel.bulkDelete(amount, true).catch((err) => {
      interaction.reply({
        content: `Failed to delete messages: ${err.message}`,
        ephemeral: true,
      });
      return null;
    });

    if (!deleted) return;

    await interaction.reply({
      content: `Deleted ${deleted.size} message(s).`,
      ephemeral: true,
    });

    const logChannelId = process.env.DISCORD_LOG_CHANNEL_ID;
    if (logChannelId && logChannelId !== channel.id) {
      const logChannel = interaction.guild?.channels.cache.get(logChannelId);
      if (logChannel?.isTextBased()) {
        await logChannel
          .send(`🧹 **${interaction.user.tag}** purged **${deleted.size}** messages in ${channel}.`)
          .catch(() => null);
      }
    }
  },
};
