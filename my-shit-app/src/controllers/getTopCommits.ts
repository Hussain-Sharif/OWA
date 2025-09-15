import { EachCommit, GithubBadResponseType, GithubGoodResponseType } from "../libs/types";
import { getRepoFileExtraInfo } from "./getRepoFileExtraInfo";


export const filteredTodaysCommits =(allCommistsData:EachCommit[])=>{
    const todayDate= new Date().getUTCDate()
    // const todayDate= new Date('2025-09-09T16:17:25.597Z').getUTCDate()

    console.log("inside getTodaysCommits")
    return allCommistsData.filter((eachCommitObj:EachCommit)=>{
        const commitDate = new Date(eachCommitObj.commit.committer.date).getUTCDate();
        return commitDate===todayDate
    })
}

export const formattedCommits = (commits:EachCommit[])=>{
    const messageTemplate=`
        Time:
        File Name: 
        Commit Message:
        <---------------------->
    `



}


export const getTopCommits =  async(userName: string, repoName: string, pat: string,repoRepsponse:GithubGoodResponseType | GithubBadResponseType)=>{
    if(typeof repoRepsponse === "object" && repoRepsponse.statusCode===200 && "data" in repoRepsponse){
        // console.log(repoRepsponse)
        console.log("inside getTopCommits")

        if(repoRepsponse.data.length===0){
            return {
                statusCode: 200,
                message: "No Commits Made Till Now",
            }
        }

        const filteredData = filteredTodaysCommits(repoRepsponse.data)

        if(filteredData.length===0){
            return {
                statusCode: 200,
                message: "No Commits Today Made",
            }
        }
        console.log("filteredData:", filteredData)

        // By here have atleast One Commit shit!

        // Now I am decided to only have SHA of every Commit 
        const listOfCommitShas = filteredData.map((eachCommitObj:EachCommit)=>{
            return eachCommitObj.sha
        })
        // console.log(listOfCommitShas) 
        console.log("Called getRepoFileExtraInfo")
        const extraInfo = await getRepoFileExtraInfo(userName, repoName, pat, listOfCommitShas)
        console.log("getRepoFileExtraInfo:", extraInfo)

        // Now return both pieces of info
        return {
            statusCode: 200,
            message: "Commits Retrieved",
            filteredCommits: filteredData,
            extraInfo: extraInfo
        }
    
    }
    return repoRepsponse;
}