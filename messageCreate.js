import { Events, EmbedBuilder } from "discord.js";

export default {
  name: Events.GuildMemberRemove,
  async execute(member) {
    const logChannelId = process.env.DISCORD_LOG_CHANNEL_ID;
    if (!logChannelId) return;

    const logChannel = member.guild.channels.cache.get(logChannelId);
    if (!logChannel?.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle("Member Left")
      .setDescription(`${member.user?.tag ?? "Unknown User"} left the server.`)
      .addFields({ name: "ID", value: member.id, inline: true })
      .setTimestamp();

    await logChannel.send({ embeds: [embed] }).catch((err) =>
      console.error("[Log] Failed to send leave log:", err.message)
    );
  },
};
