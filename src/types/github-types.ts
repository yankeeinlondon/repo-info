import type { Endpoints } from "@octokit/types";
import type { OptionalProps, SimplifyObject } from "inferred-types";

export type GithubRepoIssuesParams = OptionalProps<
  Endpoints["GET /issues"]["parameters"]
>;

export type GithubRepoIssue =
  Endpoints["GET /issues"]["response"]["data"][0];

/**
 * Meta data about a given repo (API response)
 */
export type GithubRepoMeta =
  Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"];

/**
 * Query params for getting metadata on repo
 */
export type GithubMetadataRequest = OptionalProps<
  Endpoints["GET /repos/{owner}/{repo}"]["parameters"]
>;

/**
 * The optional props for Github Commits expressed as query parameters on a GET request.
 */
export type GithubCommitsQueryParams = OptionalProps<
  SimplifyObject<Endpoints["GET /repos/{owner}/{repo}/commits"]>["parameters"]
>;

/**
 * Query parameters for Github's Branch endpoint for repos
 */
export type GithubBranchesQueryParams = OptionalProps<
  SimplifyObject<Endpoints["GET /repos/{owner}/{repo}/branches"]["parameters"]>
>;

export type GithubOrgReposQueryParams = OptionalProps<
  SimplifyObject<Endpoints["GET /orgs/{org}/repos"]["parameters"]>
>;

/**
 * Meta data about a Github Branch
 */
export type GithubBranch = Endpoints["GET /repos/{owner}/{repo}/branches"]["response"]["data"][0];

/**
 * Commits on a given repo (API response)
 */
export type GithubCommit =
  SimplifyObject<Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"][0]>;

/**
 * use the `ref` query param to set the branch
 */
export type GithubContentsQueryParams = OptionalProps<
  SimplifyObject<Endpoints["GET /repos/{owner}/{repo}/contents/{path}"]["parameters"]>
>;

// export type GithubContent =
//   Endpoints["GET /repos/{owner}/{repo}/contents/{path}"]["response"]["data"][]

export interface GithubContent {
  type: "file" | "symlink" | "dir" | "submodule";
  size: number;
  name: string;
  path: string;
  sha: string;
  url: string;
  git_url: string | null;
  html_url: string | null;
  download_url: string | null;
}
