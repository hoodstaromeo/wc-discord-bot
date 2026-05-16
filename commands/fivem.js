import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";

export default {
  data: new SlashCommandBuilder()
    .setName("fivem")
    .setDescription("Check FiveM server status and live player list"),

  async execute(interaction) {
    await interaction.deferReply();

    const serverIp = process.env.FIVEM_SERVER_IP;
    if (!serverIp) {
      return interaction.editReply("FIVEM_SERVER_IP is not configured.");
    }

    const baseUrl = `http://${serverIp}`;

    const [playersResult, infoResult] = await Promise.allSettled([
      axios.get(`${baseUrl}/players.json`, { timeout: 5000 }),
      axios.get(`${baseUrl}/info.json`, { timeout: 5000 }),
    ]);

    if (playersResult.status === "rejected" && infoResult.status === "rejected") {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("FiveM Server Status")
        .addFields(
          { name: "Status", value: "🔴 Offline or unreachable", inline: true },
          { name: "IP", value: `\`${serverIp}\``, inline: true }
        )
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    const players = playersResult.status === "fulfilled" ? playersResult.value.data : [];
    const info = infoResult.status === "fulfilled" ? infoResult.value.data : {};

    const serverName = info.vars?.sv_projectName ?? "FiveM Server";
    const maxPlayers = info.vars?.sv_maxClients ?? "?";
    const description = info.vars?.sv_projectDesc ?? null;

    const playerList =
      players.length > 0
        ? players
            .slice(0, 20)
            .map((p) => `• **${p.name}** — ping: ${p.ping}ms`)
            .join("\n")
        : "No players online right now.";

    const embed = new EmbedBuilder()
      .setColor(players.length > 0 ? 0x2ecc71 : 0x95a5a6)
      .setTitle(serverName)
      .setDescription(description)
      .addFields(
        { name: "Status", value: "🟢 Online", inline: true },
        { name: "Players", value: `${players.length} / ${maxPlayers}`, inline: true },
        { name: "IP", value: `\`${serverIp}\``, inline: true },
        {
          name: `Players online${players.length > 20 ? " (first 20)" : ""}`,
          value: playerList,
        }
      )
      .setTimestamp()
      .setFooter({ text: "FiveM Server Status" });

    await interaction.editReply({ embeds: [embed] });
  },
};
