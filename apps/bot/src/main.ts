import "dotenv/config";

import { SapphireClient } from "@sapphire/framework";
import { resolve } from "node:path";

if (!process.env.DISCORD_BOT_TOKEN) {
  throw new Error("DISCORD_BOT_TOKEN is not defined");
}

const client = new SapphireClient({
  intents: [],
  baseUserDirectory: resolve(import.meta.dirname),
});

client.login(process.env.DISCORD_BOT_TOKEN);
