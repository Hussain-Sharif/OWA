import type { FinalUserCommitsData_Summary } from "./types";

function userHasNoCommits(userData: FinalUserCommitsData_Summary): boolean {
    for (const repo of userData.allReposPerUser) {
        if ("commits" in repo && repo.commits) {
            const commits = repo.commits as any;
            if (
                (commits.renamed && Array.isArray(commits.renamed) && commits.renamed.length > 0) ||
                (commits.added && Array.isArray(commits.added) && commits.added.length > 0) ||
                (commits.modified &&
                    Array.isArray(commits.modified) &&
                    commits.modified.length > 0) ||
                (commits.created && Array.isArray(commits.created) && commits.created.length > 0)
            ) {
                return false;
            }
        }
    }
    return true;
}

export function getUsersWithNoCommits(
    allCommitsDataOfAllUsers: FinalUserCommitsData_Summary[],
): string[] {
    return allCommitsDataOfAllUsers
        .filter((userData) => userHasNoCommits(userData))
        .map((userData) => userData.userName);
}
