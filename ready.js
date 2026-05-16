import { Events, ActivityType } from "discord.js";

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`[Bot] Online as ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: "FiveM Server", type: ActivityType.Watching }],
      status: "online",
    });
  },
};
