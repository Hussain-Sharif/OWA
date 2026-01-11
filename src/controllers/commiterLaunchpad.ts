import type {
    AllSettledRepoOutput_Summary,
    CommitsObject_Summary,
    EachRepoInfo,
    EachUserInfo,
    FinalIndividualCommitResponse,
    FinalUserCommitsData_Summary,
    FormattedAllSettledRepoOutput_Summary,
    GithubBadResponseType,
    GithubGoodResponseType,
} from "../libs/types";
import { getGithubRepoInfo } from "../services/getGithubRepoInfo";
import { getSummaryObject } from "./getSummaryObject";
import { getTopCommits } from "./getTopCommits";

const getEachRepoCommitInfo = async (eachRepoPerUser: EachRepoInfo) => {
    const { USERNAME, REPONAME, PAT } = eachRepoPerUser;

    const gettingAllCommitsInfo: GithubGoodResponseType | GithubBadResponseType =
        await getGithubRepoInfo(USERNAME, REPONAME, PAT);

    const getAllTopProperCommitsInfo: FinalIndividualCommitResponse | GithubBadResponseType =
        await getTopCommits(USERNAME, REPONAME, PAT, {
            ...gettingAllCommitsInfo,
        });
    
    // console.log("getAllTopProperCommitsInfo:",getAllTopProperCommitsInfo) //debug-helper
    if (
        getAllTopProperCommitsInfo.statusCode !== 200 ||
        false === "formattedData" in getAllTopProperCommitsInfo
    ) {
        // c.status(getAllTopProperCommitsInfo.statusCode as StatusCode);
        return {
            ...getAllTopProperCommitsInfo,
            message: `${getAllTopProperCommitsInfo.message} from ${REPONAME} by ${USERNAME}`,
        };
    }

    const finalGoodResponse = getAllTopProperCommitsInfo as FinalIndividualCommitResponse;

    const newformattedSummaryData: CommitsObject_Summary = getSummaryObject(
        finalGoodResponse.formattedData,
    );

    // console.log("newformattedSummaryData:",newformattedSummaryData) //debug-helper

    return {
        statusCode: 200,
        repoName: REPONAME,
        commits: {
            ...newformattedSummaryData,
        },
    };
};

const commitLaunchpad = async (eachUserInfo: EachUserInfo) => {
    let { USERNAME, ALLREPOS, PAT } = eachUserInfo;
    ALLREPOS = ALLREPOS as string;
    ALLREPOS = JSON.parse(ALLREPOS) as string[];

    const allRepoOutputs: AllSettledRepoOutput_Summary[] = await Promise.allSettled(
        ALLREPOS.map((eachRepoPerUser) =>
            getEachRepoCommitInfo({ USERNAME, REPONAME: eachRepoPerUser, PAT }),
        ),
    );

    // console.log("allRepoOutputs:",allRepoOutputs) //debug-helper

    // Transform into success/failure array
    const formattedRepoOutputs: FormattedAllSettledRepoOutput_Summary = allRepoOutputs.map(
        (result, idx) =>
            result.status === "fulfilled"
                ? result.value
                : { error: true, repo: ALLREPOS[idx], reason: result.reason },
    );
    // console.log("formatted REpo Output:",formattedRepoOutputs) //debug-helper
    const finalUserCommitsData: FinalUserCommitsData_Summary = {
        statusCode: 200,
        userName: USERNAME,
        allReposPerUser: formattedRepoOutputs,
    };

    return finalUserCommitsData;
};

export default commitLaunchpad;
