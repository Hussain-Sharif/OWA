import { Hono } from "hono";
import { cors } from "hono/cors";

import commitLaunchpad from "./controllers/commiterLaunchpad";
import format_to_text from "./libs/format_to_text";
import { getUniqueMessagesForUsers } from "./libs/noCommitsMessages";
import { sendWhatsAppMessage } from "./services/sendmessage";
import hasNoCommits from "./libs/hasNoCommits";
import { getUsersWithNoCommits } from "./libs/getUsersWithNoCommits";
import type { Bindings, FinalUserCommitsData_Summary } from "./libs/types";
import { parseGitHubUsers } from "./libs/types";
import { resolveShortUrl } from "./services/url_shortner";

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

    const usernameToNameMap = new Map<string, string>();
    githubUsers.forEach((user) => {
        usernameToNameMap.set(user.username, user.name);
    });

    const usersWithNoCommits = getUsersWithNoCommits(allCommitsDataOfAllUsers);
    const userNames = usersWithNoCommits.map(
        (userName) => usernameToNameMap.get(userName) || userName,
    );
    const uniqueMessagesMap = getUniqueMessagesForUsers(userNames);

    const noCommitsMessages = usersWithNoCommits.map((userName) => {
        const userDisplayName = usernameToNameMap.get(userName) || userName;
        const personalizedMessage =
            uniqueMessagesMap.get(userDisplayName) ||
            `Hey ${userDisplayName}! No commits detected from you today`;
        return `${userName}\n${personalizedMessage}\n\n`;
    });

    if (hasNoCommits(allCommitsDataOfAllUsers)) {
        console.log("No commits detected from all users, sending personalized messages");
        const allNoCommitsMessage = noCommitsMessages.join("");
        await sendWhatsAppMessage({
            message: allNoCommitsMessage,
            greenApiUrl: env.BOT_GREEN_API_URL,
            chatId: env.WHATSAPP_CHAT_ID,
        });
        return { data: allCommitsDataOfAllUsers, result: allNoCommitsMessage };
    }

    if (usersWithNoCommits.length > 0) {
        console.log(
            `No commits detected from some users (${usersWithNoCommits.join(", ")}), sending message`,
        );

        const commitsResult = await format_to_text(
            allCommitsDataOfAllUsers,
            env,
            baseUrl,
            usersWithNoCommits,
        );

        const noCommitsSection = noCommitsMessages.join("");
        const combinedMessage = commitsResult
            ? `${commitsResult}${noCommitsSection}`
            : noCommitsSection;
        await sendWhatsAppMessage({
            message: combinedMessage,
            greenApiUrl: env.BOT_GREEN_API_URL,
            chatId: env.WHATSAPP_CHAT_ID,
        });
        return { data: allCommitsDataOfAllUsers, result: combinedMessage };
    }

    const result = await format_to_text(allCommitsDataOfAllUsers, env, baseUrl);
    await sendWhatsAppMessage({
        message: result,
        greenApiUrl: env.BOT_GREEN_API_URL,
        chatId: env.WHATSAPP_CHAT_ID,
    });

    return { data: allCommitsDataOfAllUsers, result };
}

app.get("/", (c) => {
    return c.json({
        "author": {
            "name": "Hussain Sharif",
            "linked_in": "https://www.linkedin.com/in/hussainsharifshaik/",
            "x": "https://x.com/Sharif1438Shaik",
            "github": "https://github.com/Hussain-Sharif/",
        },
        "name": "OWA: Obsidian-Whatsapp-Automation",
        "description": "Whatsapp bot for collabrative Obsidian Notes(.md)",
        "documentation": "https://github.com/Hussain-Sharif/Obsidian-Whatsapp-Automation",
        "endpoints": {
            "bot-triggering": {
                "GET /trigger": "Summary of the current day github commits of the Obsidian Vault repos",
            },
            "health-check": {
                "GET /health": "Check API health status"
            },
            "KV-URL_Shortner": {
                "GET /:shortId": "URL_Shortner service for github links of notes using KV-Storage"
            },
            "root": {
                "GET /": "Get API information and documentation"
            },
        },
        "features": [
            "Built with Honojs & Runs on Cloudflare",
            "Trigger: Cron job (scheduled) daily",
            "Fetch: Pull commits from multiple GitHub repos Using Github Apis from Multiple users",
            "Transform: Format into readable message + shorten URLs(shorting the github notes URLs)",
            "Send: Deliver via WhatsApp using Green Api",
            "Store: Cache shortened URLs in KV",
        ],
        "version": "1.0.0"
    })
})

app.get('/health',(c)=>{
    return c.json({
        "status": {
            "overall": "healthy",
            "timestamp": new Date()
        },
        "version": {
            "api": "1.0.0",
            "environment": c.env.ENVIRONMENT
        },
    })
})

app.get("/trigger", async (c) => {
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
        const result=await processCommits(c.env, baseUrl);
        return c.json({ success: true, result, message: "Scheduled task completed successfully" });
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
