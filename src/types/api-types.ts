/* eslint-disable no-use-before-define */
import { AlphaNumeric,  Replace, UnionToTuple } from "inferred-types";
import { ApiRequestOptions, FetchApi } from "./fetch-types";
import { BitbucketUrl, GithubUrl, GitSource, ReadmeMarkdown, Repo, RepoReference, SitemapOptions, Url } from "./general";
import { GithubBranch, GithubCommit,  GithubCommitsQueryParams, GithubOrgBranchesQueryParams, GithubRepoMeta,  } from "./github-types";
import { RepoCommit, RepoCommitOptions, RepoCommitsRequest, RepoContent, RepoIssue, RepoIssueRequest, RepoMetadataRequest, Sitemap } from "./repo";

/**
 * Options provided to consumers in the construction of a RepoInfo API
 */
export interface RepoOptions<
  TBranch extends string = "default-branch", 
  TReadme extends boolean = false, 
  TCommits extends boolean | RepoCommitOptions = false, 
  TLoadNow extends boolean = false
>  {
  branch?: TBranch;
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
    user?: string;
    token: string;
  };

  /** preloads the `README.md` if it exists */
  withReadme?: TReadme;
  /** preloads commits for the repo */
  withCommits?: TCommits;
  /**
   * By default a configuration will not be loaded immediately but
   * setting this flag to true will make it do so.
   */
  loadNow?: TLoadNow;
}

/**
 * When a user wants to partially apply a repo config but not use that
 * configuration yet, the configuration is stored as a `RepoConfig`.
 */
 export type RepoConfig<
  TRepo extends Repo,
  TBranch extends string, 
  TSource extends GitSource, 
  TWith extends string
> = {
  repo: Readonly<TRepo>;
  branch: Readonly<TBranch>;
  source: Readonly<TSource>;
  cached: UnionToTuple<TWith>;
  /**
   * Load the RepoInfo API
   */
  load: () => Promise<RepoApi<TRepo, TBranch, TSource, TWith>>;
};

export type ToRepo<T extends RepoReference> = T extends Url
  ? ToSource<T> extends GitSource.github
    ? Replace<T, "https://github.com/", "">
    : ToSource<T> extends GitSource.bitbucket
      ? Replace<Replace<T, "https://bitbucket.org/", "">, "https://bitbucket.com/", "">
      : ToSource<T> extends GitSource.gitlab
        ? Replace<T, `https://gitlab.com/`, "">
        : never
  : T;


/**
 * Type utility which converts a Repo or Url to a `GitSource`
 */
export type ToSource<T extends RepoReference> = T extends Url
  ? T extends GithubUrl
    ? GitSource.github
    : T extends BitbucketUrl
      ? GitSource.bitbucket
      : T extends `https://gitlab${string}`
        ? GitSource.gitlab
        : never
  // for now all non-URL based repos are github
  : GitSource.github;

export type ApiWith<
  TReadme extends boolean, 
  TCommits extends boolean | RepoCommitOptions
> = TReadme extends true
  ? TCommits extends false
    ? "readme"
    : "readme" | "commits"
  : TCommits extends false
    ? "none"
    : "commits";

/**
 * Type utility which converts the inputs from **RepoInfo** function into
 * either `RepoConfig` (lazy eval) or `RepoApi<...>` (immediate eval).
 */
export type RepoConvert<
  TRepo extends Repo | Url, 
  TBranch extends string, 
  TReadme extends boolean, 
  TCommits extends boolean | RepoCommitOptions ,
  TLoadNow extends boolean
> = TLoadNow extends true
  ? RepoApi<TRepo, TBranch, ToSource<TRepo>, ApiWith<TReadme, TCommits>>
  : RepoConfig<TRepo, TBranch, ToSource<TRepo>, ApiWith<TReadme, TCommits>>;






/** the Commits based API surface; which depends on whether it's pre-loaded */
export type CommitsApi<T extends boolean> = T extends true
  ? {
    /**
     * the commits gathered previously and not residing in cache
     */
    commits: readonly RepoCommit[];
    /**
     * Gets the next _page_ of commits using the same options that were 
     * originally used in the options hash and returns them while also
     * updating the original API surfaces list of commits in the `commits`
     * property.
     */
    getMoreCommits(): Promise<{ page: number; commits: RepoCommit[] }>;
  }
  : {
    /** get the commits from the repo */
    getCommits(
      options?: ApiRequestOptions<GithubCommitsQueryParams>
    ): Promise<readonly RepoCommit[]>;
  };

/** the Readme based API surface; which depends on whether it's pre-loaded */
export type ReadmeApi<W extends boolean> = W extends true 
  ? {
    readme: ReadmeMarkdown;
  }
  : {
    /**
     * Get the readme info
     */
    getReadme(): Promise<ReadmeMarkdown>;
  };

/**
 * The core API which is unaffected by what is "preloaded"
 */
export type CoreApi<R extends Repo, B extends string, S extends GitSource> = {
  repo: Readonly<R>;
  organization: Readonly<AlphaNumeric>;
  branch: Readonly<B>;
  source: Readonly<S>;
  defaultBranch: Readonly<string>;
  meta: Readonly<GithubRepoMeta>;
  listOfBranches: readonly string[];
  branchInfo: {[key: string]: GithubBranch};
};

/**
 * The part of the API surface which fetches additional info but is never preloaded.
 */
export type AlwaysFetchApi = {
  /**
   * Get the raw file content of a particular file in the repo
   */
  getFileContent(filepath: string): Promise<string>;

  /**
   * Get a list of all the repos which reside in the organization you are
   * currently working in.
   */
  getReposInOrg(options: GithubOrgBranchesQueryParams): Promise<readonly GithubRepoMeta[]>;
  /**
   * Look into a particular directory path of a repo and find the files
   * as well as sub-directories which reside at that depth.
   */
  getContentInRepo(path: string): Promise<RepoContent>;
  /**
   * Build a _sitemap_ of files and directories which reside under the 
   * `root` filepath designated.
   */
  buildSitemap(root: string, options: SitemapOptions): Promise<Sitemap>;

  /**
   * Get issues from the repository
   */
  getIssues(options: RepoIssueRequest): Promise<readonly RepoIssue[]>;
};

/**
 * An API surface for the specified Repo
 */
export type RepoApi<
  TRepo extends Repo, 
  TBranch extends string, 
  TSource extends GitSource, 
  TWith extends string = never
> = CoreApi<TRepo,TBranch,TSource> & 
  AlwaysFetchApi & 
  CommitsApi<TWith extends "commits" ? true : false> & 
  ReadmeApi<TWith extends "readme" ? true : false>;

export type RepoCache<W extends string = ""> = {
  cached: W extends "" ? [] : UnionToTuple<W>;
  branches: GithubBranch[];
  meta: GithubRepoMeta;

  commits: W extends "commits" ? readonly GithubCommit[] : never;
  readme: W extends "readme" ? ReadmeMarkdown : never;
  reposInOrg: W extends "repos-in-org" ? GithubRepoMeta[] : never;
};

export type RepoInfo<W extends string = never> = {
  repo: Repo;
  branch: string;
  source: string;
  meta: GithubRepoMeta;
} & RepoCache<W>;

/**
 * If you are to provide a vendor/provider implementation then you
 * must export this type as a default export of the give file.
 * 
 * - It receives a `FetchApi` to make all requests which helps to standardize
 * IO as well as relieve the provider of having to be involved in those details
 * - The main responsibility for each provider is to implement the API surface
 * which is specified by the `ProviderApi`. This must be fully implemented in all
 * cases, however, if you are doing a partial implementation to start you can
 * return errors for endpoints you wish to implement later.
 */
export type RepoProvider = (fetch: FetchApi) => ProviderApi;

export type ProviderApi = {
  /**
   * **getRepoMeta**
   * 
   * get meta information about a specific hosted Repo.
   */
  getRepoMeta(repo: Repo, options?: ApiRequestOptions<RepoMetadataRequest>): Promise<GithubRepoMeta>;
  /**
   * **getRepoBranches**
   * 
   * get all the branches which a repo has along with some meta info on 
   * each branch.
   */
  getRepoBranches(
    repo: Repo, 
    options?: ApiRequestOptions<GithubOrgBranchesQueryParams>
  ): Promise<GithubBranch[]>;
  /**
   * **buildSitemap**
   * 
   * Builds a hierarchical sitemap structure of files in the repo.
   */
  buildSitemap(repo: Repo, branch: string, path: string, options?: SitemapOptions): Promise<Sitemap>;
  /**
   * **getCommits**
   * 
   * Get the _commits_ for a given repo.
   */
  getCommits(repo: Repo, options?: RepoCommitsRequest): Promise<readonly GithubCommit[]>;
  /**
   * **getFileContent**
   * 
   * Get the raw file content of a particular file.
   */
  getFileContent(repo: Repo, branch: string, filepath: string): Promise<string>;

  /**
   * **getReadme**
   * 
   * Will return a `ReadmeMarkdown` which includes the _content_ property if the repo
   * has a `README.md` in the root directory.
   */
  getReadme(repo: Repo, branch: string): Promise<ReadmeMarkdown>;

  /**
   * **getContentInRepo**
   * 
   * Retrieves all files, sub-directories, and even symlinks and other artifacts 
   * for a _given directory path_ of the repo.
   */
  getContentInRepo(repo: Repo, branch: string, path: string): Promise<RepoContent>;

  /**
   * **getReposInOrg**
   * 
   * Gets meta data for all repos which are part of the the given organization.
   */
  getReposInOrg(
    org: AlphaNumeric, 
    options: ApiRequestOptions<GithubOrgBranchesQueryParams>
  ): Promise<readonly GithubRepoMeta[]>;

  /**
   * Get the Issues raised on the given repo
   */
  getIssues(repo: Repo, options: RepoIssueRequest): Promise<readonly RepoIssue[]>;
};
