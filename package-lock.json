import "dotenv/config";
import { Client, GatewayIntentBits, Partials, Collection, REST, Routes } from "discord.js";
import { readdirSync, existsSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Client setup ────────────────────────────────────────────────────────────

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.GuildMember],
});

client.commands = new Collection();

// ─── Load commands ────────────────────────────────────────────────────────────

const commandFiles = readdirSync(join(__dirname, "commands")).filter((f) => f.endsWith(".js"));

for (const file of commandFiles) {
  const { default: command } = await import(pathToFileURL(join(__dirname, "commands", file)).href);
  client.commands.set(command.data.name, command);
  console.log(`[Commands] Loaded: /${command.data.name}`);
}

// ─── Load events ─────────────────────────────────────────────────────────────

const eventsPath = join(__dirname, "events");
const eventFiles = existsSync(eventsPath)
  ? readdirSync(eventsPath).filter((f) => f.endsWith(".js"))
  : [];

for (const file of eventFiles) {
  const { default: event } = await import(pathToFileURL(join(__dirname, "events", file)).href);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`[Events] Loaded: ${event.name}`);
}

// ─── Register slash commands ──────────────────────────────────────────────────

const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token) {
  console.error("[Error] DISCORD_BOT_TOKEN is not set. Exiting.");
  process.exit(1);
}

if (guildId) {
  try {
    const rest = new REST().setToken(token);
    const clientId = Buffer.from(token.split(".")[0], "base64").toString("utf8");
    const commandData = [...client.commands.values()].map((cmd) => cmd.data.toJSON());
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandData });
    console.log(`[Commands] Registered ${commandData.length} slash commands to guild ${guildId}`);
  } catch (err) {
    console.error("[Commands] Failed to register slash commands:", err.message);
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

client.login(token);
