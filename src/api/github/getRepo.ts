import fetch, { Headers } from "node-fetch";
import { GITHUB_API_BASE } from "src/constants";
import { ApiRequestOptions, Repo } from "src/types/general";
import { GithubRepoMeta } from "src/types/req-resp";
import { fetchError } from "src/utils";

export async function getRepo(repo: Repo, options: ApiRequestOptions) {
  const url = `${GITHUB_API_BASE}/repos/${repo}`;
  const { username, password } = options;
  const headers = username && password
    ? new Headers({ username, password })
    : new Headers({});

  const res = await fetch(url, { headers });

  if(res.ok) {
    const result = ( await res.json() ) as GithubRepoMeta;
    return result;
  } else {
    throw fetchError(`Problem getting repo meta data.`, url, res)
  }  
}
