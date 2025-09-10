
// Type for one GitHub Commit (from /repos/:owner/:repo/commits API)
export type EachCommit = {
  sha: string
  node_id: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
    message: string
    tree: {
      sha: string
      url: string
    }
    url: string
    comment_count: number
    verification: {
      verified: boolean
      reason: string
      signature: string | null
      payload: string | null
      verified_at: string | null
    }
  }
  url: string
  html_url: string
  comments_url: string
  author: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    user_view_type: string
    site_admin: boolean
  }
  committer: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    user_view_type: string
    site_admin: boolean
  }
  parents: {
    sha: string
    url: string
    html_url: string
  }[]
}

export type GithubResponsedata=EachCommit[]

export type GithubGoodResponseType={
    statusCode: number,
    message:string,
    data:GithubResponsedata
}


export type GithubBadResponseType={
    statusCode: number,
    message: string,
}

// For Env types
export type Bindings ={
    SHARIF_USERNAME:string,
    SHARIF_REPONAME:string,
    SHARIF_PAT:string,
}