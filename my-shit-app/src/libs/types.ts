
// Type for one GitHub Commit (from /repos/:owner/:repo/commits API)

// <--------------------Commits Level Types------------------------>

// All possible statuses
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

//--------------------User/Repo Level Types-------------------------------->

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

//------------------------------------------------------------->

// For Env types
export type Bindings = {
    SHARIF_USERNAME: string;
    SHARIF_REPONAMES: string;
    SHARIF_PAT: string;
    SADIQ_USERNAME: string;
    SADIQ_REPONAMES: string;
    SADIQ_PAT: string;

    // Adding KV binding
    URL_SHORTENER: KVNamespace;

    // Adding green api url binding
    BOT_GREEN_API_URL:string
};
