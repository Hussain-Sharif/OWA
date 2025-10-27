import { Hono } from "hono";
import { cors } from "hono/cors";

import commitLaunchpad from "./controllers/commiterLaunchpad";
import format_to_text from "./libs/format_to_text";
import { sendWhatsAppMessage } from "./libs/sendmessage";
import type { Bindings, FinalUserCommitsData_Summary } from "./libs/types";
import { resolveShortUrl } from "./libs/url_shortner";

const app = new Hono<{ Bindings: Bindings }>();

app.use("/*", cors());

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

app.get("/", async (c) => {
    try {
        const envsOfUsers = [
            {
                USERNAME: c.env.SHARIF_USERNAME,
                ALLREPOS: c.env.SHARIF_REPONAMES,
                PAT: c.env.SHARIF_PAT,
            },
            {
                USERNAME: c.env.SADIQ_USERNAME,
                ALLREPOS: c.env.SADIQ_REPONAMES,
                PAT: c.env.SADIQ_PAT,
            },
            {
                USERNAME: c.env.SANJAY_USERNAME,
                ALLREPOS: c.env.SANJAY_REPONAMES,
                PAT: c.env.SANJAY_PAT,
            },
        ].filter((user) => user.USERNAME && user.ALLREPOS && user.PAT);

        const allCommitsDataOfAllUsers = await Promise.all(
            envsOfUsers.map(async (eachUserInfo) => {
                const getAllCommitInfoPerUser: FinalUserCommitsData_Summary =
                    await commitLaunchpad(eachUserInfo);
                return getAllCommitInfoPerUser;
            }),
        );

        const baseUrl = new URL(c.req.url).origin;

        const result = await format_to_text(allCommitsDataOfAllUsers, c.env, baseUrl);
        await sendWhatsAppMessage({
            message: result,
            greenApiUrl: c.env.BOT_GREEN_API_URL,
        });

        return c.json({ data: allCommitsDataOfAllUsers, result: result });
    } catch (error) {
        console.error("Error fetching commits:", error);
        await sendWhatsAppMessage({
            message: `Hey Guys,\nIt's me OWA\nHi Sharif anna Server Failed!,\nReason:\n${JSON.stringify(error)} \nSadiq & Sanjay are Responsible for this`,
            greenApiUrl: c.env.BOT_GREEN_API_URL,
        });
        return c.json({ statusCode: 500, message: "Failed to fetch commits" }, 500);
    }
});

app.notFound((c) => {
    return c.text("Not Found for the path " + c.req.path);
});

app.onError((error, c) => {
    c.status(500);
    return c.text("Error for the path " + c.req.path + " Error Msg: " + error.message);
});

export default app;
