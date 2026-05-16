import { Events, EmbedBuilder, TextChannel } from "discord.js";

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const guild = member.guild;

    // ── Auto role ──────────────────────────────────────────────────────────
    const autoRoleId = const autoRoleId = "1340455050853613649";;
    if (autoRoleId) {
      const role = guild.roles.cache.get(autoRoleId);
      if (role) {
        await member.roles.add(role).catch((err) =>
          console.error("[AutoRole] Failed to assign role:", err.message)
        );
      }
    }

    // ── Welcome message ────────────────────────────────────────────────────
    const welcomeChannelId = process.env.DISCORD_WELCOME_CHANNEL_ID;
    if (welcomeChannelId) {
      const channel = guild.channels.cache.get(welcomeChannelId);
      if (channel?.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor(0x2ecc71)
          .setTitle(`Welcome to ${guild.name}!`)
          .setDescription(
            `Hey ${member}, glad to have you here! 🎮\nMake sure to read the rules and enjoy your stay.`
          )
          .setThumbnail(member.user.displayAvatarURL())
          .addFields(
            { name: "Member #", value: `${guild.memberCount}`, inline: true },
            {
              name: "Joined",
              value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
              inline: true,
            }
          )
          .setTimestamp();

        await channel.send({ embeds: [embed] }).catch((err) =>
          console.error("[Welcome] Failed to send message:", err.message)
        );
      }
    }

    // ── Join log ───────────────────────────────────────────────────────────
    const logChannelId = process.env.DISCORD_LOG_CHANNEL_ID;
    if (logChannelId) {
      const logChannel = guild.channels.cache.get(logChannelId);
      if (logChannel?.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle("Member Joined")
          .setDescription(`${member} (${member.user.tag})`)
          .addFields(
            { name: "ID", value: member.id, inline: true },
            {
              name: "Account Created",
              value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
              inline: true,
            }
          )
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch((err) =>
          console.error("[Log] Failed to send join log:", err.message)
        );
      }
    }
  },
};
