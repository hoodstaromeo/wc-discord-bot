import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Show information about a user")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to look up").setRequired(false)
    ),

  async execute(interaction) {
    const member =
      interaction.options.getMember("user") ?? interaction.member;

    if (!member) {
      return interaction.reply({ content: "Could not find that member.", ephemeral: true });
    }

    const user = member.user;
    const roles = member.roles?.cache
      .filter((r) => r.id !== interaction.guild?.id)
      .map((r) => `${r}`)
      .join(", ") || "None";

    const embed = new EmbedBuilder()
      .setColor(member.displayHexColor ?? 0x3498db)
      .setTitle(user.tag)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "ID", value: user.id, inline: true },
        { name: "Nickname", value: member.nickname ?? "None", inline: true },
        {
          name: "Account Created",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: "Joined Server",
          value: member.joinedTimestamp
            ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
            : "Unknown",
          inline: true,
        },
        { name: "Roles", value: roles.slice(0, 1024) }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
