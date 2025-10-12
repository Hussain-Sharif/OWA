const format_to_text = (allCommitsDataOfAllUsers: any) => {
    console.log("inside func");
    const result = allCommitsDataOfAllUsers.map((data: any) => {
        let name = data["userName"];
        // console.log("inside m1")
        const commit_message = data.allReposPerUser.map((eachrepo: any) => {
            if (eachrepo?.commits === undefined) {
                return `\n${eachrepo.message}`;
            }
            // console.log("inside m2")
            let reponame = eachrepo.repoName;

            return `${
                eachrepo.commits?.renamed
                    ? `\nRenamed:${eachrepo.commits.renamed.map(
                          (eachrenamedfile: any, i: number) => {
                              // console.log("inside m11")
                              return `\n${i + 1}. ${reponame}/${eachrenamedfile.fileName} - ${eachrenamedfile.fileUrl}`;
                          },
                      )}\n`
                    : ""
            }${
                eachrepo.commits?.added
                    ? `\nAdded:${eachrepo.commits.added.map((eachaddedfile: any, i: number) => {
                          // console.log("inside m12")
                          return `\n${i + 1}. ${reponame}/${eachaddedfile.fileName}\n${eachaddedfile.fileUrl}`;
                      })}\n`
                    : ""
            }${
                eachrepo.commits?.modified
                    ? `\nModified:${eachrepo.commits.modified.map(
                          (eachmodifiedfile: any, i: number) => {
                              // console.log("inside m13")
                              return `\n${i + 1}. ${reponame}/${eachmodifiedfile.fileName} - ${eachmodifiedfile.fileCommitMessage}\n${eachmodifiedfile.fileUrl}`;
                          }
                      )}\n`
                    : ""
            }`;
        });
        return `${name.toUpperCase()}\n${commit_message}\n\n`;
    });

    console.log(result);
    const message = `${result}`;
    return message;
};

export default format_to_text;
