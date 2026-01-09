import type { Bindings } from "./types";
import { extractGitHubUrls, replaceUrlsInText, shortenUrlsBatch } from "../services/url_shortner";

const format_to_text = async (
    allCommitsDataOfAllUsers: any,
    env: Bindings,
    baseUrl: string,
    excludeUsers?: string[],
) => {
    const usersToFormat = excludeUsers
        ? allCommitsDataOfAllUsers.filter((data: any) => !excludeUsers.includes(data.userName))
        : allCommitsDataOfAllUsers;

    const result = usersToFormat.map((data: any) => {
        const name = data["userName"];
        const reposWithCommits = data.allReposPerUser.filter(
            (eachrepo: any) => eachrepo?.commits !== undefined,
        );

        if (reposWithCommits.length === 0) {
            return "";
        }

        const commit_message = reposWithCommits.map((eachrepo: any) => {
            const reponame = eachrepo.repoName;

            const renamedFiles =
                eachrepo.commits?.renamed?.filter(
                    (file: any) => !file.fileName.toLowerCase().endsWith(".png"),
                ) || [];

            const addedFiles =
                eachrepo.commits?.added?.filter(
                    (file: any) => !file.fileName.toLowerCase().endsWith(".png"),
                ) || [];

            const modifiedFiles =
                eachrepo.commits?.modified?.filter(
                    (file: any) => !file.fileName.toLowerCase().endsWith(".png"),
                ) || [];

            return `${
                renamedFiles.length > 0
                    ? `\nRenamed:${renamedFiles.map((eachrenamedfile: any, i: number) => {
                          return `\n${i + 1}. ${reponame}/${eachrenamedfile.fileName} - ${eachrenamedfile.fileUrl}`;
                      })}\n`
                    : ""
            }${
                addedFiles.length > 0
                    ? `\nAdded:${addedFiles.map((eachaddedfile: any, i: number) => {
                          return `\n${i + 1}. ${reponame}/${eachaddedfile.fileName}\n${eachaddedfile.fileUrl}`;
                      })}\n`
                    : ""
            }${
                modifiedFiles.length > 0
                    ? `\nModified:${modifiedFiles.map((eachmodifiedfile: any, i: number) => {
                          return `\n${i + 1}. ${reponame}/${eachmodifiedfile.fileName} - ${eachmodifiedfile.fileCommitMessage}\n${eachmodifiedfile.fileUrl}`;
                      })}\n`
                    : ""
            }`;
        });
        const commitMessageText = commit_message.join("");
        return `${name}${commitMessageText}\n\n`;
    });

    let message = result.join("");
    if (env && baseUrl) {
        const githubUrls = extractGitHubUrls(message);
        if (githubUrls.length > 0) {
            console.log(`Shortening ${githubUrls.length} URLs...`);
            const urlMap = await shortenUrlsBatch(githubUrls, env, baseUrl);
            message = replaceUrlsInText(message, urlMap);
            console.log(`URLs shortened successfully`);
        }
    }

    return message;
};

export default format_to_text;
