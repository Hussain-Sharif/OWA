import { Hono } from "hono";
import { cors } from "hono/cors";
import {
    Bindings,
    FinalUserCommitsData_Summary,
} from "./libs/types";
import commitLaunchpad from "./controllers/commiterLaunchpad";
import { sendWhatsAppMessage } from "./libs/sendmessage";
import format_to_text from "./libs/format_to_text";
import { resolveShortUrl } from "./libs/url_shortner";
//CONFIG AND APP readiness
const app = new Hono<{ Bindings: Bindings }>();

// CORS
app.use("/*", cors());

//Routes

// Add URL redirection route
app.get("/:shortId", async (c) => {
  const shortId = c.req.param('shortId');
  
  try {
    const originalUrl = await resolveShortUrl(shortId, c.env);
    
    if (originalUrl) {
      return c.redirect(originalUrl, 302);
    }
    
    return c.text('Short URL not found', 404);
  } catch (error) {
    console.error('Error resolving short URL:', error);
    return c.text('Error resolving URL', 500);
  }
});

// Main Route
app.get("/", async (c) => {
    // console.log(`initial env`,c.env);

    // <------------------------Initial Commiter Launchpad------------------------------------->

    // <==========================Don't Touch Below this======================================>

    // const gettingAllCommitsInfo: GithubGoodResponseType | GithubBadResponseType = await getGithubRepoInfo(
    //     c.env.SHARIF_USERNAME,
    //     c.env.SHARIF_REPONAME,
    //     c.env.SHARIF_PAT,
    // );
    // // getTopCommits({...gettingAllCommitsInfo})
    // const getAllTopProperCommitsInfo:FinalIndividualCommitResponse | GithubBadResponseType = await getTopCommits(
    //     c.env.SHARIF_USERNAME,
    //     c.env.SHARIF_REPONAME,
    //     c.env.SHARIF_PAT,
    //     {
    //         ...gettingAllCommitsInfo,
    //     },
    // );
    // if( getAllTopProperCommitsInfo.statusCode !== 200 || false===("formattedData" in getAllTopProperCommitsInfo)){
    //     c.status(getAllTopProperCommitsInfo.statusCode as StatusCode);
    //     return c.json(getAllTopProperCommitsInfo);
    // }

    // const finalGoodResponse= getAllTopProperCommitsInfo as FinalIndividualCommitResponse

    // const newformattedSummaryData=getSummaryObject(finalGoodResponse.formattedData);

    // const USERNAME=c.env.SHARIF_USERNAME
    // const AllREPOS=c.env.SHARIF_REPONAMES
    // const PAT=c.env.SHARIF_PAT
    // const eachUserInfo={USERNAME,AllREPOS,PAT}
    // <==========================Don't Touch Above this======================================>

    try {
            console.log('KV Debug:', {
        hasKV: !!c.env.URL_SHORTENER,
        envKeys: Object.keys(c.env)
    });

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
        ];

        const allCommitsDataOfAllUsers = await Promise.all(
            envsOfUsers.map(async (eachUserInfo) => {
                const getAllCommitInfoPerUser: FinalUserCommitsData_Summary =
                    await commitLaunchpad(eachUserInfo);
                return getAllCommitInfoPerUser;
            }),
        );

        // Get base URL for short links
        const baseUrl = new URL(c.req.url).origin;

        const result = await format_to_text(allCommitsDataOfAllUsers, c.env, baseUrl);
        
        
        await sendWhatsAppMessage(result);
        
        
        return c.json({ data: allCommitsDataOfAllUsers, result:result });
        // return c.json(allCommitsDataOfAllUsers);
    } catch (error) {
        console.error("Error fetching commits:", error);
        await sendWhatsAppMessage(
            `Hey Guys,\nIt's me OWA\nHi Sharif anna Server Failed!,\nReason:\n${JSON.stringify(error)} \nSadiq & Sanjay are Responsible for this`,
        );
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
