import { Endpoints } from "@octokit/types";

export type GithubRepoResp =
  Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"];