import { ExtraInfoGoodResponseCommit, GithubBadResponseType } from "../libs/types";

const fetchExtraInfoPerCommit = async (
    userName: string,
    repoName: string,
    pat: string,
    eachCommitSha: string,
) => {
    try {
        const urlPath = `https://api.github.com/repos/${userName}/${repoName}/commits/${eachCommitSha}`;
        // console.log("Requesting:", urlPath);

        const response = await fetch(urlPath, {
            headers: {
                "User-Agent": "Hono-App",
                Authorization: `token ${pat}`,
            },
        });

        // console.log("Response status:", response.status);
        const data = await response.json();

        if (!response.ok) {
            return { statusCode: response.status, message: await response.text() };
        }

        return {
            statusCode: response.status,
            message: "All Good We Got Data",
            data: data,
        };
    } catch (error: any) {
        console.error("fetchExtraInfoPerCommit ERROR:", error);
        return { statusCode: 500, message: "Internal Server Error" };
    }
};

// Parallel Handling!!..
export const getRepoFileExtraInfo = async (
    userName: string,
    repoName: string,
    pat: string,
    repoCommitShas: string[],
) => {
    // console.log("getRepoFileExtraInfo START:", repoCommitShas);

    const allResponses:ExtraInfoGoodResponseCommit[]|GithubBadResponseType[] = await Promise.all(
        repoCommitShas.map(async (eachCommitSha: string) => {
            // console.log("Fetching commit:", eachCommitSha);
            const res:ExtraInfoGoodResponseCommit|GithubBadResponseType = await fetchExtraInfoPerCommit(userName, repoName, pat, eachCommitSha);
            // console.log("Fetched commit:", eachCommitSha, res?.statusCode);
            return res;
        }),
    );

    // console.log("getRepoFileExtraInfo END:", allResponses.length);
    return allResponses;
};
