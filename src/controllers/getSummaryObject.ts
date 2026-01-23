import type {
    CommitsObject_Summary,
    EachFilePerCommitInfo_Summary,
    FormattedData,
} from "../libs/types";

/*

Logic Thinking for the File grouping based on the statuses is by the 
categorization in which understanding with Oldest-first way!

files:

 Older  -> newer -> newer        

added -> renamed  =>(finalize) renamed 
        -> modified  =>(finalize) modified
        -> renamed -> modified =>(finalize) modified 
        -> modifed -> renamed  =>(finalize) renamed
        -> removed =>(finalize) removed

(renamed can't be go under added)
renamed -> modified =>(finalize) modified 
          ->  (finalize) renamed 
         -> removed =>(finalize) removed

(modifed can't be go under added)
modifed -> renamed =>(finalize) renamed
          -> modified {ignored}
          -> removed =>(finalize) removed  
*/

const finalGroupingBasedOnStatuses = (allPossibleFileCommits: EachFilePerCommitInfo_Summary[]) => {
    const filteringMap = new Map();
    
    // The commits are in "Newest-first" order
    allPossibleFileCommits.forEach((eachFileData) => {
        const fileName = eachFileData.fileName;
        const currentStatus = eachFileData.fileRemainingInfo.fileStatus;
        
        // Skip if file doesn't exist in map yet
        if (!filteringMap.has(fileName)) {
            // Only track: added, modified, renamed (ignore removed, copied, changed, unchanged)
            if (["added", "modified", "renamed"].includes(currentStatus)) {
                filteringMap.set(fileName, eachFileData.fileRemainingInfo);
            }
            return; // Move to next file
        }
        
        // File already exists in map (processing older commits now)
        const previousStatus = filteringMap.get(fileName)?.fileStatus;
        
        // Handle status transitions [older{currentStatus} → newer{previousStatus}]
        
        // Case 1: File was added, then modified → keep as "modified"
        if (currentStatus === "added" && previousStatus === "modified") {
            // Keep the newer "modified" status
            return;
        }
        
        // Case 2: File was added, then renamed → keep as "renamed"
        if (currentStatus === "added" && previousStatus === "renamed") {
            // Keep the newer "renamed" status
            return;
        }
        
        // Case 3: File was modified, then renamed → keep as "renamed"
        if (currentStatus === "modified" && previousStatus === "renamed") {
            // Keep the newer "renamed" status, do nothing
            return;
        }
        
        // Case 4: File was renamed, then modified → keep as "modified"
        if (currentStatus === "renamed" && previousStatus === "modified") {
            // Keep the newer "renamed" status, do nothing
            return;
        }
        
        // Case 5: File was modified multiple times → keep latest
        if (currentStatus === "modified" && previousStatus === "modified") {
            // Already have latest, do nothing
            return;
        }
        
        // Case 6: File was added/modified/renamed, then removed → remove from map
        if (currentStatus === "removed") {
            filteringMap.delete(fileName);
            return;
        }
    });
    
    // Group files by their final status
    const categorizedMap = new Map();
    
    for (const [fileName, fileInfo] of filteringMap) {
        const status = fileInfo.fileStatus;
        
        if (!categorizedMap.has(status)) {
            categorizedMap.set(status, []);
        }
        
        categorizedMap.get(status)!.push({
            ...fileInfo,
            fileName,
        });
    }
    
    return Object.fromEntries(categorizedMap);
};


export const getSummaryObject = (formattedData: FormattedData) => {
    const fileAndRemObj: EachFilePerCommitInfo_Summary[] =
        formattedData.listOfFormattedCommitData.flatMap((eachCommit) =>
            eachCommit.eachCommitFiles.map(
                (eachFile): EachFilePerCommitInfo_Summary => ({
                    fileName: eachFile.fileName,
                    fileRemainingInfo: {
                        fileStatus: eachFile.status,
                        fileUrl: eachFile.fileUrl,
                        fileCommitDateTime: eachCommit.eachCommitDateTime,
                        fileCommitMessage: eachCommit.eachCommitMessage,
                    },
                }),
            ),
        );
    console.log(fileAndRemObj)
    return finalGroupingBasedOnStatuses(fileAndRemObj) as CommitsObject_Summary;
};
