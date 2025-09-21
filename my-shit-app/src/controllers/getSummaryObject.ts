import { CommitsObject_Summary, EachFilePerCommitInfo_Summary, ExtraInfoGoodResponseCommit, FormattedData } from "../libs/types";
import allPossiableFileCommitsTestData from '../Tests/allPossiableFileCommits.tests.json'


const finalGroupingBasedOnStatuses=(allPossiableFileCommitsTestData:EachFilePerCommitInfo_Summary[])=>{
    const filteringMap=new Map()

    allPossiableFileCommitsTestData.forEach((eachFileData: { fileName: string; fileRemainingInfo: { fileStatus: string; fileUrl: string; fileCommitDateTime: string; fileCommitMessage: string; }; }) => {
        // Handling if Element is new to filteringMap
        if(
            !filteringMap.has(eachFileData.fileName)
             && 
            eachFileData.fileRemainingInfo.fileStatus!=="deleted" // Let me Not Include the Deleted Files At all in to the filteringMap
        ){
            filteringMap.set(eachFileData.fileName,eachFileData.fileRemainingInfo)
        }else{
            // If Already Had the same File Name

            // Let say That Same File is Created Initialy Now Modified/Renamed any no of TIMES -> we Ignore it



            // Initially File is renamed/modified & In followed Commits it is keeping modified as its status --> updating the Commit Message & Other Info
            if(filteringMap.has(eachFileData.fileName) 
                && 
           eachFileData.fileRemainingInfo.fileStatus==="modified"
                &&
                (
                    filteringMap.get(eachFileData.fileName).fileStatus==="modified" ||
                    filteringMap.get(eachFileData.fileName).fileStatus==="renamed"
                )
        ){
                filteringMap.set(eachFileData.fileName,eachFileData.fileRemainingInfo)
            } 
            else if (  // If the File is renamed/modified Initialy Now it is Renamed -->Keeping it as Renamed...Updating the Commit Message & Other Info
                filteringMap.has(eachFileData.fileName) 
                && 
                eachFileData.fileRemainingInfo.fileStatus==="renamed"
                &&
                (
                    filteringMap.get(eachFileData.fileName).fileStatus==="modified" ||
                    filteringMap.get(eachFileData.fileName).fileStatus==="renamed" 
                )
            ){
                filteringMap.set(eachFileData.fileName,eachFileData.fileRemainingInfo)
            }            
            else if(  // If the File is renamed/created/modified Initialy and now it is Deleted -->Remove From the Map 
                filteringMap.has(eachFileData.fileName) 
                && 
            eachFileData.fileRemainingInfo.fileStatus==="deleted"
                &&
                (
                    filteringMap.get(eachFileData.fileName).fileStatus==="created" ||
                    filteringMap.get(eachFileData.fileName).fileStatus==="modified"||
                    filteringMap.get(eachFileData.fileName).fileStatus==="renamed"
                )
        ){
                filteringMap.delete(eachFileData.fileName)
            }
        }
        
        
        
        
    })
    // return  Object.fromEntries(filteringMap); //here I have checked it is working fine

    const categorizedMap=new Map()

    const it=filteringMap[Symbol.iterator]()

    for (let eachCommit of it){
    // console.log(eachCommit)
    const currCommitStatus=eachCommit[1].fileStatus
    
    const currCommitRelatedInfo={
        ...eachCommit[1],
        fileName:eachCommit[0],
    }
    // if new category is added here for the 1st time
    if(!categorizedMap.has(currCommitStatus)){
        categorizedMap.set(currCommitStatus,[currCommitRelatedInfo])
    }else{
        categorizedMap.set(currCommitStatus,[...categorizedMap.get(currCommitStatus),currCommitRelatedInfo])
    }
    }

    // console.log(Object.fromEntries(categorizedMap))

    return Object.fromEntries(categorizedMap)


}

export const getSummaryObject=(formattedData:FormattedData)=>{
     const fileAndRemObj:EachFilePerCommitInfo_Summary[]=formattedData.listOfFormattedCommitData.flatMap((acc)=>{
        
        const getAllFiles=(eachCommit:FormattedData["listOfFormattedCommitData"][0])=>{
           const result=eachCommit.eachCommitFiles.map((eachFile):EachFilePerCommitInfo_Summary=>{
            return {
                fileName:eachFile.fileName,
                fileRemainingInfo:{
                    fileStatus:eachFile.status,
                    fileUrl:eachFile.fileUrl,
                    fileCommitDateTime:eachCommit.eachCommitDateTime,
                    fileCommitMessage:eachCommit.eachCommitMessage
                }
            }
           })
            return [...result]
        }

        const dataReFormatted:EachFilePerCommitInfo_Summary[]=getAllFiles(acc)
        return dataReFormatted
         
     })

     // For Testing purposes Using JSON Data to Filter the things
    //  console.log(fileAndRemObj)

     const result:CommitsObject_Summary=finalGroupingBasedOnStatuses(fileAndRemObj)

    //  console.log(result)

     return result
}