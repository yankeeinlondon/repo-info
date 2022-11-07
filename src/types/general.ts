import { RepoContent, RepoFile } from "./repo";

export type Url = `https://${string}`;
export type Repo = `${string}/${string}`;
export type GithubUrl = `${Url}github.com/${string}/${string}`;
export type BitbucketUrl = `${Url}bitbucket.${"org" | "com"}/${string}/${string}`;
export type GitlabUrl = `${Url}gitlab.com/${string}/${string}`;

export type RepoReference = Repo | Url;

/**
 * The platform/host which is hosting the repo
 */
export enum GitSource {
  /** the repo is hosted at Github */
  "github" = "github",
  /** the repo is hosted at Bitbucket */
  "bitbucket" = "bitbucket",
  /** the repo is hosted at GitLab */
  "gitlab" = "gitlab",
  /** ERROR: the source of the repo could not be determined */
  "unknown" = "unknown"
}

export interface SitemapOptions {
  /**
   * Filter function which can test directory names; only those which pass
   * are recursed.
   */
  directoryFilter?: (dir: string, ctx: RepoContent) => boolean;
  /**
   * Filter function which tests whether the given file should be included in
   * the file names of the sitemap.
   */
  fileFilter?: (filename: string, ctx: RepoFile) => boolean;

  /**
   * The maximum depth which you want to traverse into the repo
   */
  depth?: number;
}

/**
 * A simple data structure returned when a README.md has been requested
 * for a given repo. It will return regardless of whether such a file
 * actually exists in the specified repo.
 */
export interface ReadmeMarkdown {
  exists: boolean;
  content?: string;
  rawUrl: Url;
  editorUrl: Url;
}

