import type { ExtraInfoGoodResponseCommit, GithubBadResponseType } from "../libs/types";

const fetchExtraInfoPerCommit = async (
    userName: string,
    repoName: string,
    pat: string,
    eachCommitSha: string,
) => {
    try {
        const urlPath = `https://api.github.com/repos/${userName}/${repoName}/commits/${eachCommitSha}`;

        const response = await fetch(urlPath, {
            headers: {
                "User-Agent": "Hono-App",
                Authorization: `token ${pat}`,
            },
        });

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
    const allResponses: ExtraInfoGoodResponseCommit[] | GithubBadResponseType[] = await Promise.all(
        repoCommitShas.map(async (eachCommitSha: string) => {
            const res: ExtraInfoGoodResponseCommit | GithubBadResponseType =
                await fetchExtraInfoPerCommit(userName, repoName, pat, eachCommitSha);
            return res;
        }),
    );

    return allResponses;
};
