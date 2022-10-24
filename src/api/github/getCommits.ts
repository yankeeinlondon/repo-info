import { GITHUB_API_BASE } from "src/constants";
import { GithubCommits, GithubCommitsQueryParams, } from "src/types/req-resp";
import fetch, {Headers} from "node-fetch";
import queryString from "query-string";
import { ApiRequestOptions, Repo } from "src/types/general";
import { fetchError } from "src/utils";

export async function getCommits(
  repo: Repo,
  options: ApiRequestOptions<{qp: GithubCommitsQueryParams}>
): Promise<GithubCommits> {
  const { username, password, qp } = options;
  const params: GithubCommitsQueryParams = { page: 1, per_page: 3, ...qp };
  const url = `${GITHUB_API_BASE}/repos/${repo}/commits${queryString.stringify(params)}`;
  const headers = username && password
    ? new Headers({ username, password })
    : new Headers({});
  const res = await fetch(url, { headers });

  if(res.ok) {
    const result = await res.json();
    return result as GithubCommits;
  } else {
    throw fetchError(`Problems getting commits from repo.`, url, res)
  }
}
