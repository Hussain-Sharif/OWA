import { ExtraInfoGoodResponseCommit, FormattedData } from "../libs/types";
import allPossiableFileCommitsTestData from '../Tests/allPossiableFileCommits.tests.json'


const finalGroupingBasedOnStatuses=(allPossiableFileCommitsTestData:any)=>{
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
    return  Object.fromEntries(filteringMap); //here I have checked it is working fine

    


}

export const getSummaryObject=(formattedData:FormattedData)=>{
     const fileAndRemObj=formattedData.listOfFormattedCommitData.flatMap((acc)=>{
        
        const getAllFiles=(eachCommit:FormattedData["listOfFormattedCommitData"][0])=>{
           const result=eachCommit.eachCommitFiles.map(eachFile=>{
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

        const dataReFormatted=getAllFiles(acc)
        return dataReFormatted
         
     })

     const result=finalGroupingBasedOnStatuses(allPossiableFileCommitsTestData)

     return {fileAndRemObj,result}
}