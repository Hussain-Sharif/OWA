const format_to_text = async (allCommitsDataOfAllUsers: any) => {
    const result = allCommitsDataOfAllUsers.map((data: any) => {
        let name = data["userName"];
        const commit_message = data.allReposPerUser.map((eachrepo: any) => {
            let reponame = eachrepo.repoName;

            return `\n\nrenamed:\n${eachrepo.commits.renamed.map(
                (eachrenamedfile: any, i: number) => {
                    return `${i + 1}. ${reponame}/${eachrenamedfile.fileName} - ${eachrenamedfile.fileUrl}\n`;
                }
            )}<=====>\n\nadded:\n${eachrepo.commits.added.map((eachaddedfile: any, i: number) => {
                return `${i + 1}. ${reponame}/${eachaddedfile.fileName} - ${eachaddedfile.fileCommitMessage}\n${eachaddedfile.fileUrl}\n`;
            })}<=====>\n\nmodified:\n${eachrepo.commits.modified.map(
                (eachmodifiedfile: any, i: number) => {
                    return `${i + 1}. ${reponame}/${eachmodifiedfile.fileName} - ${eachmodifiedfile.fileCommitMessage}\n${eachmodifiedfile.fileUrl}\n`;
                }
            )}`;
        });
        return `${name}\n${commit_message}`;
    });

    console.log(result);
    const message = `${result}`;
    return message;
};

export default format_to_text;
