import "dotenv/config";

import type { Dispatch } from "@datamine/dispatch";
import { serve } from "@hono/node-server";
import type { CommitCommentEvent } from "@octokit/webhooks-types";
import { Hono } from "hono";
import { hc } from "hono/client";
import { verifyGithub } from "./util/verifyGithub.ts";

const dispatch = hc<Dispatch>(
  process.env.DISPATCH_URL ?? "http://dispatch:5001/",
);
const app = new Hono();

const ingest = app.post("/", async (c) => {
  const event: CommitCommentEvent = await c.req.json();
  const verified = verifyGithub(
    c.req.header("x-hub-signature-256") as string,
    event,
  );

  if (!verified) {
    return c.json({ error: "Invalid signature" }, 401);
  }

  if (c.req.header("x-github-event") !== "commit_comment") {
    return c.json({ error: "Invalid event" }, 400);
  }

  if (
    event.repository.name !==
    (process.env.GITHUB_REPOSITORY_NAME ?? "Discord-Datamining")
  ) {
    return c.json({ error: "Invalid repository" }, 401);
  }

  const res = await dispatch.ingest.$post({
    json: {
      title: `[${event.repository.owner.login}/${
        event.repository.name
      }] New comment on commit \`${event.comment.commit_id.substring(
        0,
        7,
      )}\``,
      description:
        event.comment.body.length > 4091
          ? `${event.comment.body.substring(0, 4091)}…\n\`\`\``
          : event.comment.body,
      url: event.comment.html_url,
      author: {
        name: event.comment.user.login,
        icon_url: event.comment.user.avatar_url,
        url: event.comment.user.html_url,
      },
      timestamp: new Date(event.comment.created_at).toISOString(),
    },
  });
  if (!res.ok) {
    return c.json({ error: "Dispatch failed" }, 500);
  }
  const data = await res.text();
  return c.text(data);
});

serve(
  {
    ...app,
    port: Number(process.env.PORT ?? 5000),
  },
  (addr) => {
    console.log(`Listening on http://localhost:${addr.port}`);
  },
);

export type Ingest = typeof ingest;
