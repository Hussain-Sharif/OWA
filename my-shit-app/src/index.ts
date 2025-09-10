import { Hono } from "hono";
import { cors } from "hono/cors";
import { getGithubRepoInfo } from "./routes/getGithubRepoInfo";
import { Bindings, GithubBadResponseType, GithubGoodResponseType } from "./libs/types";
import { StatusCode } from "hono/utils/http-status";

export interface Env {
    SHARIF_USERNAME: string;
    SHARIF_REPONAME: string;
    SHARIF_PAT: string;
}

//CONFIG AND APP readiness
const app = new Hono<{ Bindings: Bindings }>();

// CORS
app.use("/*", cors());

//Routes
app.get("/", async (c) => {
    console.log("🥁", c.env);
    const response: GithubGoodResponseType | GithubBadResponseType = await getGithubRepoInfo(
        c.env.SHARIF_USERNAME,
        c.env.SHARIF_REPONAME,
        c.env.SHARIF_PAT,
    );
    c.status(response.statusCode as StatusCode);
    return c.json({ response });
});

app.notFound((c) => {
    return c.text("Not Found for the path " + c.req.path);
});

app.onError((error, c) => {
    c.status(500);
    return c.text("Error for the path " + c.req.path + " Error Msg: " + error.message);
});

export default app;
