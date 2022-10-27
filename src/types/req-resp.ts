import { Endpoints, Url } from "@octokit/types";
import { OptionalProps, SimplifyObject } from "inferred-types";
import { Repo } from "./general";

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
>;

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
export type GithubCommit =
  SimplifyObject<Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"][0]>;

/**
 * use the `ref` query param to set the branch
 */
export type GithubContentsQueryParams = OptionalProps<
  SimplifyObject<Endpoints["GET /repos/{owner}/{repo}/contents/{path}"]["parameters"]>
>;

// export type GithubContent = 
//   Endpoints["GET /repos/{owner}/{repo}/contents/{path}"]["response"]["data"]

export type GithubContent = {
    type: "file" | "symlink" | "dir" | "submodule";
    size: number;
    name: string;
    path: string;
    sha: string;
    url: string;
    git_url: string | null;
    html_url: string | null;
    download_url: string | null;
};

export interface RepoFile {
  kind: "file";
  filename: string;
  /**
   * the directory path which holds the file
   */
  filepath: string;
  sha: string;
  size: number;
  content?: string;
  /** comes from the download_url prop on github and just presents the files content without any chrome */
  raw_url: Url;
  /** comes from the html_url prop on github */
  url: Url;
}

export interface RepoSymLink {
  kind: "symlink";
  sha: string;
}

export interface RepoSubmodule {
  kind: "submodule";
  name: string;
  sha: string;
}


/**
 * Info garnished for a particular directory in a Repo.
 * Unlike `SitemapDirectory` -- which is recursive -- 
 * this data structure only knows the _string_ name 
 * of the sub-directories.
 */
export interface RepoContent {
  dir: string;
  files: RepoFile[];
  subDirectories: string[];
  otherAssets?: (RepoSymLink | RepoSubmodule)[];
}

/** 
 * A recursive structure designed to store directory info of a Sitemap 
 */
export interface SitemapDirectory {
  dir: string;
  files: RepoFile[];
  subDirectories: SitemapDirectory[];
}

export interface FlatSitemap {
  repo: Repo;
  branch: string;
  /**
   * The root filepath which the sitemap began at
   */
  path: string;
  files: RepoFile[];
}

/**
 * A hierarchical sitemap built from a repo
 */
export interface Sitemap {
  repo: Repo;
  branch: string;
  root: SitemapDirectory;
  flatten: () => FlatSitemap;
}