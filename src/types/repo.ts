import { Repo, Url } from "./general";
import { GithubBranch, GithubCommit, GithubCommitsQueryParams, GithubRepoIssue, GithubRepoMeta } from "./github";

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

// TODO: abstract this from Github version
export type RepoCommitsRequest = GithubCommitsQueryParams;

// TODO: abstract this from Github version
export type RepoCommit = GithubCommit;

// TODO: abstract this from Github version
export type RepoIssue = GithubRepoIssue;

// TODO: abstract this from Github version
export type RepoMetadata = GithubRepoMeta;

// TODO: abstract this from Github version
export type RepoBranch = GithubBranch;

// TODO: abstract this from Github version
export type RepoCommitOptions = GithubCommitsQueryParams;