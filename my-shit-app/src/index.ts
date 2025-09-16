import { Hono } from "hono";
import { cors } from "hono/cors";
import { getGithubRepoInfo } from "./controllers/getGithubRepoInfo";
import { Bindings, GithubBadResponseType, GithubGoodResponseType } from "./libs/types";
import { StatusCode } from "hono/utils/http-status";
import { getTopCommits } from "./controllers/getTopCommits";

//CONFIG AND APP readiness
const app = new Hono<{ Bindings: Bindings }>();

// CORS
app.use("/*", cors());

//Routes
app.get("/", async (c) => {
    // console.log(c.env);
    const sharifResponse: GithubGoodResponseType | GithubBadResponseType = await getGithubRepoInfo(
        c.env.SHARIF_USERNAME,
        c.env.SHARIF_REPONAME,
        c.env.SHARIF_PAT,
    );
    c.status(sharifResponse.statusCode as StatusCode);
    // getTopCommits({...sharifResponse})
    return c.json(
        getTopCommits(c.env.SHARIF_USERNAME, c.env.SHARIF_REPONAME, c.env.SHARIF_PAT, {
            ...sharifResponse,
        }),
    );
});

app.notFound((c) => {
    return c.text("Not Found for the path " + c.req.path);
});

app.onError((error, c) => {
    c.status(500);
    return c.text("Error for the path " + c.req.path + " Error Msg: " + error.message);
});

export default app;
