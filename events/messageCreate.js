import { Events, EmbedBuilder } from "discord.js";

const INVITE_PATTERNS = [
  "discord.gg/",
  "discord.com/invite/",
  "discordapp.com/invite/"
];

export default {
  name: Events.MessageCreate,

  async execute(message) {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();
    const hasInvite = INVITE_PATTERNS.some((p) => content.includes(p));

    if (!hasInvite) return;

    if (message.member.roles.cache.some(role => role.name === "LASD")) return;

    await message.delete().catch(() => null);

    await message.author
      .send("Your message was removed because it contained a Discord invite link.")
      .catch(() => null);

    const logChannelId = process.env.DISCORD_LOG_CHANNEL_ID;

    if (logChannelId) {
      const logChannel = message.guild?.channels.cache.get(logChannelId);

      if (logChannel?.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor(0xe67e22)
          .setTitle("Auto-Mod: Invite Link Removed")
          .addFields(
            {
              name: "User",
              value: `${message.author} (${message.author.tag})`,
              inline: true,
            },
            {
              name: "Channel",
              value: `${message.channel}`,
              inline: true
            },
            {
              name: "Content",
              value: message.content.slice(0, 500)
            }
          )
          .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => null);
      }
    }
  },
};
