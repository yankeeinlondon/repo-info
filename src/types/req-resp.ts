import { Endpoints } from "@octokit/types";
import { OptionalProps, SimplifyObject } from "inferred-types";

/**
 * Meta data about a given repo (API response)
 */
export type GithubRepoMeta =
  Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"];

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
>

export type GithubOrgBranchesQueryParams = OptionalProps<
  SimplifyObject<Endpoints["GET /orgs/{org}/repos"]["parameters"]>
>;

/**
 * Meta data about a Github Branch
 */
export type GithubBranch = Endpoints["GET /repos/{owner}/{repo}/branches"]["response"]["data"][0];

/**
 * Commits on a given repo (API response)
 */
export type GithubCommits =
  SimplifyObject<Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]>;