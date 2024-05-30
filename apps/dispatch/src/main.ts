import "dotenv/config";

import { database } from "@datamine/database";
import { REST } from "@discordjs/rest";
import { serve } from "@hono/node-server";
import {
  AllowedMentionsTypes,
  Routes,
  type APIEmbed,
  type RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v10";
import { Hono } from "hono";
import { validator } from "hono/validator";

if (!process.env.DISCORD_BOT_TOKEN) {
  throw new Error("DISCORD_BOT_TOKEN is not defined");
}

const rest = new REST({ version: "10" }).setToken(
  // biome-ignore lint/style/noNonNullAssertion: check is ran before the function
  process.env.DISCORD_BOT_TOKEN!,
);

const app = new Hono();

const dispatch = app
  .post(
    "/ingest",
    validator<APIEmbed, string, string, "json", Promise<APIEmbed>>(
      "json",
      async (value) => {
        return value;
      },
    ),
    async (c) => {
      const body = await c.req.valid("json");
      const servers = await database.query.servers.findMany();
      for (const server of servers) {
        try {
          await rest.post(
            Routes.channelMessages(`${BigInt(server.channel)}`),
            {
              body: {
                content: server.role
                  ? `<@&${BigInt(server.role)}>`
                  : "",
                embeds: [body],
                allowed_mentions: {
                  parse: [AllowedMentionsTypes.Role],
                },
              } satisfies RESTPostAPIChannelMessageJSONBody,
            },
          );
        } catch (error) {
          console.error(error);
        }
      }
      return c.text(`Fanning out to ${servers.length} servers.`);
    },
  )
  .post("/announcement", async (c) => {
    return c.text("Not Implemented");
  });

serve(
  {
    ...app,
    port: Number(process.env.PORT ?? 5001),
  },
  (addr) => {
    console.log(`Listening on http://localhost:${addr.port}`);
  },
);

export type Dispatch = typeof dispatch;
