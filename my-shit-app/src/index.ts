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
        c.env.SHARIF_REPONAME, // previous: My-Notes-Vault
        c.env.SHARIF_PAT,
    );
    // getTopCommits({...sharifResponse})
    const finalSharifResponse = await getTopCommits(
        c.env.SHARIF_USERNAME,
        c.env.SHARIF_REPONAME,
        c.env.SHARIF_PAT,
        {
            ...sharifResponse,
        },
    );
    if(finalSharifResponse.statusCode !== 200){
        c.status(finalSharifResponse.statusCode as StatusCode);
        return c.json(finalSharifResponse);
    }
    

    c.status(sharifResponse.statusCode as StatusCode);
    return c.json(finalSharifResponse);
});

app.notFound((c) => {
    return c.text("Not Found for the path " + c.req.path);
});

app.onError((error, c) => {
    c.status(500);
    return c.text("Error for the path " + c.req.path + " Error Msg: " + error.message);
});

export default app;
