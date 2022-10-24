import { GITHUB_API_BASE } from "src/constants";
import { ApiRequestOptions } from "src/types/general";
import fetch, { Headers } from "node-fetch";
import queryString from "query-string";
import { fetchError } from "src/utils";
import { GithubOrgBranchesQueryParams, GithubRepoMeta } from "src/types/req-resp";
import { AlphaNumeric } from "inferred-types";


export async function getOrgRepoList(
  org: AlphaNumeric,
  options: ApiRequestOptions<{qp: GithubOrgBranchesQueryParams}>
): Promise<readonly GithubRepoMeta[]> {
  const { username, password, qp } = options;
  const params: GithubOrgBranchesQueryParams = { sort: "updated", direction: "desc", per_page: 30, ...qp };
  const url = `${GITHUB_API_BASE}/orgs/${org}/repos?${queryString.stringify(params)}`;
  const headers = username && password
    ? new Headers({ username, password })
    : new Headers({});
  const res = await fetch(url, { headers });

  if (res.ok) {
    const result = await res.json() as readonly GithubRepoMeta[];
    return result;
  } else {
    throw fetchError(`Problem getting repos from the organization "${org}".`, url, res);
  }

}
