import { EachCommit, GithubBadResponseType, GithubGoodResponseType } from "../libs/types";


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
    
}


export const getTopCommits = (repoRepsponse:GithubGoodResponseType | GithubBadResponseType)=>{
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

        


        return filteredTodaysCommits(repoRepsponse.data)
    
    }
    return repoRepsponse;
}