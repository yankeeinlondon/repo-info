import { GITHUB_API_BASE } from "src/constants";
import { ApiRequestOptions, Repo } from "src/types/general";
import { dictArr } from "inferred-types";
import fetch, { Headers } from "node-fetch";
import queryString from "query-string";
import { fetchError } from "src/utils";
import { GithubBranch, GithubBranchesQueryParams } from "src/types/req-resp";


/**
 * Returns a dictionary of branch meta with each _key_ being a branch
 * that exists on the repo.
 */
export const getRepoBranches = async (
  repo: Repo,
  options: ApiRequestOptions<{qp: GithubBranchesQueryParams}>
): Promise<Record<string, GithubBranch>> => {
  const { username, password, qp } = options;
  const params: GithubBranchesQueryParams = { page: 1, per_page: 30, ...qp };
  const url = `${GITHUB_API_BASE}/repos/${repo}/branches?${queryString.stringify(params)}`;
    const headers = username && password
    ? new Headers({ username, password })
    : new Headers({});
  const res = await fetch(url, { headers });

  if (res.ok) {
    const result = await res.json() as readonly GithubBranch[];
    const branches = dictArr(...result).toLookup("name");

    return branches;
  } else {
    throw fetchError(`Problem getting branch info for repo.`, url, res);
  }
};
