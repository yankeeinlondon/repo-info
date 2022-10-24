import { Endpoints } from "@octokit/types";
import { GITHUB_API_BASE } from "src/constants";
import { Repo } from "src/types/general";
import { dictArr } from "inferred-types";
import fetch from "node-fetch";

export type GithubRepoBranchesReq =
  Endpoints["GET /repos/{owner}/{repo}/branches"]["request"];
export type GithubRepoBranchesResp =
  Endpoints["GET /repos/{owner}/{repo}/branches"]["response"];

export type GithubBranch = GithubRepoBranchesResp["data"][0];
export type BranchInfo<B extends string> = Record<B, GithubBranch>


/**
 * Get's a list of branches for a given repo
 */
export const getRepoBranches = async <B extends string>(
  ownerRepo: Repo
): Promise<Record<string, GithubBranch>> => {
  const url = `${GITHUB_API_BASE}/repos/${ownerRepo}/branches&per_page=30&page=1`;
  const res = await fetch(url);

  if (res.ok) {
    const result = await res.json() as readonly GithubBranch[];
    const branches = dictArr(...result).toLookup("name");

    return branches;
  } else {
    throw new Error(
      `Problem loading Github URL: ${url}. Error status: ${res.status}`
    );
  }
};
