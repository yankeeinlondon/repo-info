import { AlphaNumeric } from "inferred-types";
import { GithubBranch, GithubCommit,  GithubCommitsQueryParams, GithubOrgBranchesQueryParams, GithubRepoMeta, RepoContent, RepoFile, Sitemap } from "./req-resp";

export type Url = string;

export type Repo = `${string}/${string}`;
export type GithubUrl = `https://github.com/${string}/${string}`;

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

export interface RepoOptions {
  /**
   * It's a good idea to provide an API _user_ and _token_ whenever
   * you use operate with a Repo's API. You may be able to make some
   * requests without it but you will be severely limited in how many
   * requests you can make.
   * 
   * **Note:** the user and token will be looked for in the ENV but whatever
   * is passed in a parameter is given precedence.
   */
  auth?: {
    user: string;
    token: string;
  };

}

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

export type ApiRequestOptions<T extends {} = {}> = { 
  username?: string;
  password?: string;
  qp?: T; 
};

export interface ReadmeMarkdown {
  exists: boolean;
  content?: string;
  rawUrl: Url;
  editorUrl: Url;
}

/**
 * An API surface for the specified Repo
 */
export type RepoApi<R extends Repo, B extends string, S extends GitSource> = {
  repo: Readonly<R>;
  organization: Readonly<AlphaNumeric>;
  branch: Readonly<B>;
  source: Readonly<S>;
  defaultBranch: Readonly<string>;
  meta: Readonly<GithubRepoMeta>;
  listOfBranches: readonly string[];
  branchInfo: {[key: string]: GithubBranch};

  /**
   * When first instantiating this API you will be moved into
   * the _default_ branch unless you expressed it explicitly.
   *
   * For some API calls the branch doesn't matter but if you need
   * to switch to another for those where it does you can do so
   * with this call.
   */
  switchToBranch<NB extends string>(branch: NB): RepoApi<R, NB, S>;

  getCommits(options?: ApiRequestOptions<GithubCommitsQueryParams>): Promise<readonly GithubCommit[]>;
  getFileContent(filepath: string): Promise<string>;
  getReadme(): Promise<ReadmeMarkdown>;
  getReposInOrg(org: AlphaNumeric, options: ApiRequestOptions<GithubOrgBranchesQueryParams>): Promise<readonly GithubRepoMeta[]>;

  getContentInRepo(path: string): Promise<RepoContent>;

  buildSitemap(root: string, options: SitemapOptions): Promise<Sitemap>;
};



export type RepoProvider = {
  getRepoMeta(repo: Repo, options: ApiRequestOptions): Promise<GithubRepoMeta>;
  getRepoBranches(repo: Repo, options: ApiRequestOptions<GithubOrgBranchesQueryParams>): Promise<{[key: string]: GithubBranch}>;
    /**
   * Builds a hierarchical sitemap structure of files in
   * the repo.
   */
  buildSitemap(repo: Repo, branch: string, path: string, options: SitemapOptions): Promise<Sitemap>;

  getCommits(repo: Repo, options: ApiRequestOptions<GithubCommitsQueryParams>): Promise<readonly GithubCommit[]>;
  getFileContent(repo: Repo, branch: string, filepath: string): Promise<string>;

  getReadme(repo: Repo, branch: string): Promise<ReadmeMarkdown>;

  getContentInRepo(repo: Repo, branch: string, path: string): Promise<RepoContent>;

  getReposInOrg(
    org: AlphaNumeric, 
    options: ApiRequestOptions<GithubOrgBranchesQueryParams>
  ): Promise<readonly GithubRepoMeta[]>;
};
