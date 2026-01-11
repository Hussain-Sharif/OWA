import type {
    CommitsObject_Summary,
    EachFilePerCommitInfo_Summary,
    FormattedData,
} from "../libs/types";

const finalGroupingBasedOnStatuses = (allPossibleFileCommits: EachFilePerCommitInfo_Summary[]) => {
    const filteringMap = new Map();
    // The commits in the order of newest-first
    allPossibleFileCommits.forEach(
        (eachFileData: {
            fileName: string;
            fileRemainingInfo: {
                fileStatus: string;
                fileUrl: string;
                fileCommitDateTime: string;
                fileCommitMessage: string;
            };
        }) => {
            if (
                !filteringMap.has(eachFileData.fileName) &&
                eachFileData.fileRemainingInfo.fileStatus !== "deleted"
            ) {
                filteringMap.set(eachFileData.fileName, eachFileData.fileRemainingInfo);
            } else {
                // The file name already exists in the map.
                // Handle different transitions based on the current and previous statuses.

                const fileName = eachFileData.fileName;
                const currentStatus = eachFileData.fileRemainingInfo.fileStatus;
                const previousStatus = filteringMap.get(fileName)?.fileStatus;

                // 1. The file was previously 'modified' or 'renamed' and is 'modified' again:
                if (
                    filteringMap.has(fileName) &&
                    currentStatus === "modified" &&
                    (previousStatus === "renamed")
                ) {
                    filteringMap.set(fileName, eachFileData.fileRemainingInfo);
                }
                // 2. The file was previously 'modified' or 'renamed' and is now 'renamed':
                else if (
                    filteringMap.has(fileName) &&
                    currentStatus === "renamed" &&
                    (previousStatus === "modified" )
                ) {
                    filteringMap.set(fileName, eachFileData.fileRemainingInfo);
                }
                // 3. The file was previously 'created', 'modified', or 'renamed' and is now 'deleted':
                else if (
                    filteringMap.has(fileName) &&
                    currentStatus === "deleted" &&
                    (previousStatus === "created" ||
                        previousStatus === "modified" ||
                        previousStatus === "renamed")
                ) {
                    filteringMap.delete(fileName);
                }
            }
        },
    );

    const categorizedMap = new Map();

    // console.log("inside finalgrouping filteringMap:",filteringMap) //debug-helper

    const it = filteringMap[Symbol.iterator]();
    for (const eachCommit of it) {
        const currCommitStatus = eachCommit[1].fileStatus;
        const currCommitRelatedInfo = {
            ...eachCommit[1],
            fileName: eachCommit[0],
        };

        if (!categorizedMap.has(currCommitStatus)) {
            categorizedMap.set(currCommitStatus, [currCommitRelatedInfo]);
        } else {
            categorizedMap.set(currCommitStatus, [
                ...categorizedMap.get(currCommitStatus),
                currCommitRelatedInfo,
            ]);
        }
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

    return finalGroupingBasedOnStatuses(fileAndRemObj) as CommitsObject_Summary;
};
