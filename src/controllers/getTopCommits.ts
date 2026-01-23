import { isToday } from "date-fns";
import type {
    EachCommit,
    EachFileOnCommit,
    ExtraInfoGoodResponseCommit,
    GithubBadResponseType,
    GithubGoodResponseType,
} from "../libs/types";
import { getRepoFileExtraInfo } from "../services/getRepoFileExtraInfo";

// Local testing:
// export const filteredTodaysCommits = (allCommistsData: EachCommit[]) => {
//     return allCommistsData.filter((eachCommitObj: EachCommit) => {
//         const commitDate = new Date(eachCommitObj.commit.committer.date);
//         return isToday(commitDate);
//     });
// };

// prod:
export const filteredTodaysCommits = (allCommistsData: EachCommit[]) => {
    const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST = UTC+5:30
    
    // Get current time in IST
    const nowUTC = new Date();
    const nowIST = new Date(nowUTC.getTime() + IST_OFFSET);
    
    // Determine the 10 PM window boundaries
    let windowStartIST: Date;
    let windowEndIST: Date;
    
    const currentHourIST = nowIST.getUTCHours(); // Use getUTC since we shifted to IST
    
    if (currentHourIST > 22) { // After 10 PM IST
        // Window: {eachCommitTime > [Today-10PM]} to {[Tomorrow-10PM] >= eachCommitTime}
        windowStartIST = new Date(Date.UTC(
            nowIST.getUTCFullYear(),
            nowIST.getUTCMonth(),
            nowIST.getUTCDate(),
            22, 0, 0, 0
        ));
        windowEndIST = new Date(windowStartIST.getTime() + 24 * 60 * 60 * 1000);
    } else { // Before 10 PM IST
        // Window: {eachCommitTime > [Yesterday-10PM]} to {[Today-10PM] >= eachCommitTime }
        windowEndIST = new Date(Date.UTC(
            nowIST.getUTCFullYear(),
            nowIST.getUTCMonth(),
            nowIST.getUTCDate(),
            22, 0, 0, 0
        ));
        windowStartIST = new Date(windowEndIST.getTime() - 24 * 60 * 60 * 1000);
    }
    
    // Convert IST boundaries back to UTC for comparison
    const windowStartUTC = new Date(windowStartIST.getTime() - IST_OFFSET);
    const windowEndUTC = new Date(windowEndIST.getTime() - IST_OFFSET);
    
    console.log('Filter window (IST):', JSON.stringify({
        start: new Date(windowStartUTC.getTime() + IST_OFFSET).toISOString(),
        end: new Date(windowEndUTC.getTime() + IST_OFFSET).toISOString()
    }));
    
    return allCommistsData.filter((eachCommitObj: EachCommit) => {
        const commitDateUTC = new Date(eachCommitObj.commit.committer.date);
        
        // Check if commit falls within window
        return commitDateUTC >= windowStartUTC && commitDateUTC < windowEndUTC;
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
        // console.log(`\n`+'before filtering:',JSON.stringify(repoRepsponse.data))

        const filteredData: EachCommit[] = filteredTodaysCommits(repoRepsponse.data);
        if (filteredData.length === 0) {
            return {
                statusCode: 200,
                message: "No Commits Today Made",
            };
        }
        // console.log(`\n`+'After filtering:',JSON.stringify(filteredData))
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
        // console.log(`\n`+"formatted Data per data :",JSON.stringify(formattedData)) //debug-helper
        // const debuggingFilter={
        //         beforeFilter:repoRepsponse.data,
        //         afterFilter:filteredData
        //     }
        return {
            statusCode: 200,
            message: "Commits Retrieved",
            formattedData,
        };
    }
    return repoRepsponse;
};
