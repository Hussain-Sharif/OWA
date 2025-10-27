import { Hono } from "hono";
import { cors } from "hono/cors";

import commitLaunchpad from "./controllers/commiterLaunchpad";
import format_to_text from "./libs/format_to_text";
import { sendWhatsAppMessage } from "./libs/sendmessage";
import type { Bindings, FinalUserCommitsData_Summary } from "./libs/types";
import { parseGitHubUsers } from "./libs/types";
import { resolveShortUrl } from "./libs/url_shortner";

const app = new Hono<{ Bindings: Bindings }>();

app.use("/*", cors());

async function processCommits(env: Bindings, baseUrl: string) {
    const githubUsers = parseGitHubUsers(env.GITHUB_USERS);
    const envsOfUsers = githubUsers.map((user) => ({
        USERNAME: user.username,
        ALLREPOS: JSON.stringify(user.repositories),
        PAT: user.pat,
    }));

    const allCommitsDataOfAllUsers = await Promise.all(
        envsOfUsers.map(async (eachUserInfo) => {
            const getAllCommitInfoPerUser: FinalUserCommitsData_Summary =
                await commitLaunchpad(eachUserInfo);
            return getAllCommitInfoPerUser;
        }),
    );

    const result = await format_to_text(allCommitsDataOfAllUsers, env, baseUrl);
    await sendWhatsAppMessage({
        message: result,
        greenApiUrl: env.BOT_GREEN_API_URL,
        chatId: env.WHATSAPP_CHAT_ID,
    });

    return { data: allCommitsDataOfAllUsers, result };
}

app.get("/", async (c) => {
    try {
        const baseUrl = new URL(c.req.url).origin;
        const result = await processCommits(c.env, baseUrl);
        return c.json(result);
    } catch (error: unknown) {
        console.error("Error fetching commits:", error);
        await sendWhatsAppMessage({
            message: `Hey Guys,\nIt's me OWA\nHi Sharif anna Server Failed!,\nReason:\n${JSON.stringify(error)} \nSadiq & Sanjay are Responsible for this`,
            greenApiUrl: c.env.BOT_GREEN_API_URL,
            chatId: c.env.WHATSAPP_CHAT_ID,
        });
        return c.json({ statusCode: 500, message: "Failed to fetch commits" }, 500);
    }
});

// Work only in development
app.get("/test-cron", async (c) => {
    if (c.env.ENVIRONMENT !== "development") {
        return c.text("This endpoint is only available in development", 403);
    }

    try {
        console.log("Manual cron trigger via /test-cron endpoint");
        const baseUrl = new URL(c.req.url).origin;
        await processCommits(c.env, baseUrl);
        return c.json({ success: true, message: "Scheduled task completed successfully" });
    } catch (error: unknown) {
        console.error("Error in test cron:", error);
        return c.json({ success: false, error: String(error) }, 500);
    }
});

app.get("/:shortId", async (c) => {
    const shortId = c.req.param("shortId");
    try {
        const originalUrl = await resolveShortUrl(shortId, c.env);
        if (originalUrl) {
            return c.redirect(originalUrl, 302);
        }
        return c.text("Short URL not found", 404);
    } catch (error) {
        console.error("Error resolving short URL:", error);
        return c.text("Error resolving URL", 500);
    }
});

app.notFound((c) => {
    return c.text(`Not Found for the path ${c.req.path}`);
});

app.onError((error, c) => {
    c.status(500);
    return c.text(`Error for the path ${c.req.path} Error Msg: ${error.message}`);
});

export default {
    fetch: app.fetch,
    async scheduled(event: ScheduledEvent, env: Bindings, _ctx: ExecutionContext) {
        console.log("Cron triggered at:", new Date(event.scheduledTime).toISOString());
        try {
            const baseUrl =
                env.ENVIRONMENT === "development" ? "http://localhost:8787" : env.WORKER_URL;
            await processCommits(env, baseUrl);
            console.log("Scheduled task completed successfully");
        } catch (error) {
            console.error("Error in scheduled task:", error);
            await sendWhatsAppMessage({
                message: `Hey Guys,\nIt's me OWA\nScheduled task failed!\nReason:\n${JSON.stringify(error)}`,
                greenApiUrl: env.BOT_GREEN_API_URL,
                chatId: env.WHATSAPP_CHAT_ID,
            });
        }
    },
};
