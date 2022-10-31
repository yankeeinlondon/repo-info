
import { GithubOrgBranchesQueryParams } from "./github-types";
import { RepoContent, RepoFile } from "./repo";

export type Url = `https://${string}`;

export type Repo = `${string}/${string}`;
export type GithubUrl = `${Url}github.com/${string}/${string}`;
export type BitbucketUrl = `${Url}bitbucket.${"org" | "com"}/${string}/${string}`;
export type GitlabUrl = `${Url}gitlab.com/${string}/${string}`;

export type RepoReference = Repo | Url;

export interface FetchGlobalOptions {
  username?: string;
  password?: string;
  qp?: { 
    page?: string;
    per_page?: string;
    direction?: GithubOrgBranchesQueryParams["direction"];
  };
}

export type FetchApi<R extends unknown = unknown, QP extends {} = {}> = (
  url: string, 
  content: "json" | "text", 
  errText: string, 
  qp?: QP, 
  additionalHeaders?: Record<string, any>
) => Promise<R>;


export type GitSource = "github" | "bitbucket" | "gitlab";

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



export interface ReadmeMarkdown {
  exists: boolean;
  content?: string;
  rawUrl: Url;
  editorUrl: Url;
}

