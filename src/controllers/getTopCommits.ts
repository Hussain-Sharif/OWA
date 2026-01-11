import { isToday } from "date-fns";
import type {
    EachCommit,
    EachFileOnCommit,
    ExtraInfoGoodResponseCommit,
    GithubBadResponseType,
    GithubGoodResponseType,
} from "../libs/types";
import { getRepoFileExtraInfo } from "../services/getRepoFileExtraInfo";

export const filteredTodaysCommits = (allCommistsData: EachCommit[]) => {
    return allCommistsData.filter((eachCommitObj: EachCommit) => {
        const commitDate = new Date(eachCommitObj.commit.committer.date);
        return isToday(commitDate);
    });
};

export const formattedCommits = (
    allExtraInfocommits: ExtraInfoGoodResponseCommit[] | GithubBadResponseType[],
) => {
    const allExtraInfoGoodCommits = allExtraInfocommits as ExtraInfoGoodResponseCommit[];
    const authorName = allExtraInfoGoodCommits[0]?.data?.author?.login;

    const listOfFormattedCommitData = allExtraInfoGoodCommits?.map(
        (eachExtraInfoCommit: ExtraInfoGoodResponseCommit) => {
            const commitTimeDate = eachExtraInfoCommit.data.commit.committer.date;
            const formatedTimeDate = new Date(commitTimeDate).toLocaleString();

            const eachCommitMessage = eachExtraInfoCommit.data.commit.message;
            let eachCommitFiles = eachExtraInfoCommit.data.files.map(
                (eachFile: EachFileOnCommit) => {
                    return {
                        fileName: eachFile.filename,
                        status: eachFile.status,
                        fileUrl: eachFile.blob_url,
                    };
                },
            );

            // ignore .obsidian folder
            eachCommitFiles = eachCommitFiles.filter((eachFile) => {
                return !eachFile.fileName.includes(".obsidian");
            });

            return {
                eachCommitDateTime: formatedTimeDate,
                eachCommitMessage,
                eachCommitFiles,
            };
        },
    );

    return {
        authorName,
        listOfFormattedCommitData,
    };
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
                message: "No Commits Today Made",
            };
        }

        const listOfCommitShas: string[] = filteredData.map((eachCommitObj: EachCommit) => {
            return eachCommitObj.sha;
        });

        const extraInfo: ExtraInfoGoodResponseCommit[] | GithubBadResponseType[] =
            await getRepoFileExtraInfo(userName, repoName, pat, listOfCommitShas);

        const gotAtleastOneBadResponse = extraInfo.some(
            (eachCommitObj: ExtraInfoGoodResponseCommit | GithubBadResponseType) => {
                return "statusCode" in eachCommitObj && eachCommitObj.statusCode !== 200;
            },
        );

        if (gotAtleastOneBadResponse) {
            return {
                statusCode: 500,
                message: "Internal Server Error",
            };
        }

        const formattedData = formattedCommits(extraInfo);
        // console.log("formatted Data per data :",formattedData) //debug-helper
        return {
            statusCode: 200,
            message: "Commits Retrieved",
            formattedData,
        };
    }
    return repoRepsponse;
};
