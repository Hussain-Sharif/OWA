import { ExtraInfoGoodResponseCommit, FormattedData } from "../libs/types";


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

     return fileAndRemObj
}