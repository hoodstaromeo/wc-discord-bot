import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import axios from "axios";

function normalizeAddress(value) {
  return value?.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export default {
  data: new SlashCommandBuilder()
    .setName("sunucu")
    .setDescription("West Carson FiveM sunucusunun anlık durumunu gösterir"),

  async execute(interaction) {
    await interaction.deferReply();

    const serverAddress = normalizeAddress(process.env.FIVEM_SERVER_IP);
    const connectAddress = process.env.FIVEM_CONNECT_ADDRESS?.trim() || serverAddress;
    const joinUrl = process.env.FIVEM_JOIN_URL?.trim();
    const logoUrl = process.env.SERVER_LOGO_URL?.trim();

    if (!serverAddress) {
      return interaction.editReply({
        content: "❌ Railway Variables bölümünde `FIVEM_SERVER_IP` ayarlanmamış.",
      });
    }

    const baseUrl = `http://${serverAddress}`;
    const startedAt = Date.now();

    const [playersResult, infoResult, dynamicResult] = await Promise.allSettled([
      axios.get(`${baseUrl}/players.json`, { timeout: 6000 }),
      axios.get(`${baseUrl}/info.json`, { timeout: 6000 }),
      axios.get(`${baseUrl}/dynamic.json`, { timeout: 6000 }),
    ]);

    const latency = Date.now() - startedAt;
    const reachable = [playersResult, infoResult, dynamicResult].some(
      (result) => result.status === "fulfilled"
    );

    if (!reachable) {
      const offlineEmbed = new EmbedBuilder()
        .setColor(0xed4245)
        .setAuthor({ name: "WEST CARSON ROLEPLAY", iconURL: logoUrl || undefined })
        .setTitle("🔴 Sunucu şu anda çevrimdışı")
        .setDescription(
          "Sunucuya ulaşılamıyor. Bakım, restart veya geçici bağlantı problemi olabilir."
        )
        .addFields(
          { name: "Durum", value: "`KAPALI`", inline: true },
          { name: "Bağlantı", value: `\`connect ${connectAddress}\``, inline: true }
        )
        .setFooter({ text: "West Carson • Sunucu Durumu" })
        .setTimestamp();

      if (logoUrl) offlineEmbed.setThumbnail(logoUrl);
      return interaction.editReply({ embeds: [offlineEmbed] });
    }

    const players = playersResult.status === "fulfilled" && Array.isArray(playersResult.value.data)
      ? playersResult.value.data
      : [];
    const info = infoResult.status === "fulfilled" ? infoResult.value.data ?? {} : {};
    const dynamic = dynamicResult.status === "fulfilled" ? dynamicResult.value.data ?? {} : {};

    const serverName =
      dynamic.hostname || info.vars?.sv_projectName || process.env.SERVER_DISPLAY_NAME || "West Carson Roleplay";
    const maxPlayers =
      Number(dynamic.sv_maxclients || info.vars?.sv_maxClients || process.env.FIVEM_MAX_PLAYERS) || "?";
    const queueText = process.env.FIVEM_QUEUE_TEXT?.trim() || "Aktif sıra bilgisi bulunmuyor";

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setAuthor({ name: "WEST CARSON ROLEPLAY", iconURL: logoUrl || undefined })
      .setTitle("🟢 Sunucu Aktif")
      .setDescription(`**${serverName}** şu anda oyuncu kabul ediyor.`)
      .addFields(
        { name: "👥 Oyuncular", value: `**${players.length} / ${maxPlayers}**`, inline: true },
        { name: "📡 Durum", value: "`ONLINE`", inline: true },
        { name: "⚡ Yanıt", value: `\`${latency} ms\``, inline: true },
        { name: "🎮 Bağlantı Komutu", value: `\`connect ${connectAddress}\`` },
        { name: "📋 Sıra", value: queueText, inline: true },
        { name: "🔄 Son Kontrol", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: "West Carson • Your story starts here" })
      .setTimestamp();

    if (logoUrl) embed.setThumbnail(logoUrl);

    const payload = { embeds: [embed] };

    if (joinUrl && /^https?:\/\//i.test(joinUrl)) {
      payload.components = [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Sunucuya Bağlan")
            .setEmoji("🎮")
            .setStyle(ButtonStyle.Link)
            .setURL(joinUrl)
        ),
      ];
    }

    return interaction.editReply(payload);
  },
};
