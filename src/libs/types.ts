export type FileStatus = "renamed" | "modified" | "created" | "deleted";

export type EachCommit = {
    sha: string;
    node_id: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        committer: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
        tree: {
            sha: string;
            url: string;
        };
        url: string;
        comment_count: number;
        verification: {
            verified: boolean;
            reason: string;
            signature: string | null;
            payload: string | null;
            verified_at: string | null;
        };
    };
    url: string;
    html_url: string;
    comments_url: string;
    author: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        user_view_type: string;
        site_admin: boolean;
    };
    committer: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        user_view_type: string;
        site_admin: boolean;
    };
    parents: {
        sha: string;
        url: string;
        html_url: string;
    }[];
};

export type GithubResponsedata = EachCommit[];

export type ExtraInfoGoodResponseCommit = {
    statusCode: number;
    message: string;
    data: EachCommit & {
        stats: {
            total: number;
            additions: number;
            deletions: number;
        };
        files: {
            sha: string;
            filename: string;
            status: FileStatus;
            additions: number;
            deletions: number;
            changes: number;
            blob_url: string;
            raw_url: string;
            contents_url: string;
            patch: string;
        }[];
    };
};

export type EachFileOnCommit = ExtraInfoGoodResponseCommit["data"]["files"][0];

export type FormattedData = {
    authorName: string;
    listOfFormattedCommitData: {
        eachCommitDateTime: string;
        eachCommitMessage: string;
        eachCommitFiles: {
            fileName: string;
            status: FileStatus;
            fileUrl: string;
        }[];
    }[];
};

export type FinalIndividualCommitResponse = {
    statusCode: number;
    message: string;
    formattedData: FormattedData;
};

export type GithubGoodResponseType = {
    statusCode: number;
    message: string;
    data: GithubResponsedata;
};

export type GithubBadResponseType = {
    statusCode: number;
    message: string;
};

export interface EachFilePerCommitInfo_Summary {
    fileName: string;
    fileRemainingInfo: {
        fileStatus: FileStatus;
        fileUrl: string;
        fileCommitDateTime: string;
        fileCommitMessage: string;
    };
}

export interface FilteredCommitFileInfo_Summary {
    fileStatus: "renamed" | "modified" | "created"; // literal union
    fileUrl: string;
    fileCommitDateTime: string; // keep as string, can parse later into Date
    fileCommitMessage: string;
    fileName: string;
}
export interface CommitsObject_Summary {
    renamed: FilteredCommitFileInfo_Summary[];
    modified: FilteredCommitFileInfo_Summary[];
    created: FilteredCommitFileInfo_Summary[];
}

export interface EachRepoCommitInfo_Summary {
    statusCode: number;
    repoName: string;
    commits: CommitsObject_Summary;
}

export type AllSettledRepoOutput_Summary =
    | {
          status: "fulfilled";
          value: EachRepoCommitInfo_Summary | GithubBadResponseType;
      }
    | {
          status: "rejected";
          reason: any;
      };
export type FormattedAllSettledRepoOutput_Summary = (
    | GithubBadResponseType
    | EachRepoCommitInfo_Summary
    | { error: boolean; repo: string; reason: any }
)[];

export type FinalUserCommitsData_Summary = {
    statusCode: number;
    userName: string;
    allReposPerUser: FormattedAllSettledRepoOutput_Summary;
};

export type EachUserInfo = {
    USERNAME: string;
    ALLREPOS: string | string[];
    PAT: string;
};

export type EachRepoInfo = {
    USERNAME: string;
    REPONAME: string;
    PAT: string;
};

export type GitHubUser = {
    username: string;
    repositories: string[];
    pat: string;
};

export type Bindings = {
    ENVIRONMENT: "development" | "production";
    GITHUB_USERS: string; // JSON string of GitHubUser[]
    URL_SHORTENER: KVNamespace;
    BOT_GREEN_API_URL: string; // https://INSTANCE.api.green-api.com/waInstanceXXX/{method}/TOKEN
    WHATSAPP_CHAT_ID: string;
    WORKER_URL: string;
};

function isGitHubUser(obj: unknown): obj is GitHubUser {
    if (!obj || typeof obj !== "object") return false;
    const user = obj as Record<string, unknown>;

    return (
        typeof user.username === "string" &&
        user.username.length > 0 &&
        Array.isArray(user.repositories) &&
        user.repositories.length > 0 &&
        user.repositories.every((r) => typeof r === "string") &&
        typeof user.pat === "string" &&
        user.pat.length > 0
    );
}

export function parseGitHubUsers(jsonString: string): GitHubUser[] {
    if (!jsonString || jsonString.trim() === "") {
        throw new Error("GITHUB_USERS environment variable is required");
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonString);
    } catch (error) {
        throw new Error(
            `Invalid JSON in GITHUB_USERS: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
    }

    if (!Array.isArray(parsed)) {
        throw new Error("GITHUB_USERS must be a JSON array");
    }

    if (parsed.length === 0) {
        throw new Error("GITHUB_USERS array cannot be empty");
    }

    const validUsers: GitHubUser[] = [];
    const errors: string[] = [];

    parsed.forEach((item, index) => {
        if (!isGitHubUser(item)) {
            const user = item as Record<string, unknown>;
            const issues: string[] = [];

            if (!user || typeof user !== "object") {
                issues.push("not an object");
            } else {
                if (!user.username || typeof user.username !== "string") {
                    issues.push("missing or invalid 'username'");
                }
                if (!Array.isArray(user.repositories) || user.repositories.length === 0) {
                    issues.push("missing or empty 'repositories' array");
                }
                if (!user.pat || typeof user.pat !== "string") {
                    issues.push("missing or invalid 'pat'");
                }
            }

            errors.push(`User at index ${index}: ${issues.join(", ")}`);
        } else {
            validUsers.push(item);
        }
    });

    if (errors.length > 0) {
        throw new Error(`Invalid GITHUB_USERS configuration:\n${errors.join("\n")}`);
    }
    return validUsers;
}
