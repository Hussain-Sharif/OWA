import { EachCommit, ExtraInfoGoodResponseCommit, GithubBadResponseType, GithubGoodResponseType } from "../libs/types";
import { getRepoFileExtraInfo } from "./getRepoFileExtraInfo";
import { isToday } from "date-fns";

export const filteredTodaysCommits = (allCommistsData: EachCommit[]) => {
  
    // console.log("inside getTodaysCommits");
    return allCommistsData.filter((eachCommitObj: EachCommit) => {
        const commitDate = isToday(new Date(eachCommitObj.commit.committer.date));
        return commitDate;
    });
};

export const formattedCommits = (allExtraInfocommits: ExtraInfoGoodResponseCommit[] | GithubBadResponseType[] ) => {

    const allExtraInfoGoodCommits=allExtraInfocommits as ExtraInfoGoodResponseCommit[]

    console.log("Formatting Commits length:",allExtraInfoGoodCommits.length)

    const messageTemplate = `
        By userName

        Time:
        File Name: 
        Commit Message:
        Files:
        (Created) fileName,
        (Updated) fileName,
        (Deleted) fileName,
        <---------------------->
    `;
    
    const authorName=allExtraInfoGoodCommits[0].data.author.login
    
    
};

export const getTopCommits = async (
    userName: string,
    repoName: string,
    pat: string,
    repoRepsponse: GithubGoodResponseType | GithubBadResponseType,
) => {
    if (
        typeof repoRepsponse === "object" &&
        repoRepsponse.statusCode === 200 &&
        "data" in repoRepsponse
    ) {
        // console.log(repoRepsponse)
        // console.log("inside getTopCommits", userName, repoName, pat);

        if (repoRepsponse.data.length === 0) {
            return {
                statusCode: 200,
                message: "No Commits Made Till Now",
            };
        }
        const filteredData: EachCommit[] = filteredTodaysCommits(repoRepsponse.data);
        if (filteredData.length === 0) {
            return {
                statusCode: 200,
                message: "No Commits Today Made"
            };
        }

        // By here have atleast One Commit shit!

        // Now I am decided to only have SHA of every Commit
        const listOfCommitShas: string[] = filteredData.map((eachCommitObj: EachCommit) => {
            return eachCommitObj.sha;
        });

        // console.log("Called getRepoFileExtraInfo");
        const extraInfo:ExtraInfoGoodResponseCommit[]|GithubBadResponseType[]  = await getRepoFileExtraInfo(userName, repoName, pat, listOfCommitShas);
        // console.log("getRepoFileExtraInfo:", extraInfo);

        const gotAtleastOneBadResponse = extraInfo.some((eachCommitObj: ExtraInfoGoodResponseCommit|GithubBadResponseType) => {
            return "statusCode" in eachCommitObj && eachCommitObj.statusCode !== 200;
        });

        if (gotAtleastOneBadResponse) {
            return {
                statusCode: 500,
                message: "Internal Server Error",
            };
        }

        // Format the Data from extraInfo iff statusCode is 200
        const formattedData = formattedCommits(extraInfo);

        // Now return both pieces of info
        return {
            statusCode: 200,
            message: "Commits Retrieved",
            filteredCommits: filteredData,
            extraInfo: extraInfo,
        };
    }
    return repoRepsponse;
};
