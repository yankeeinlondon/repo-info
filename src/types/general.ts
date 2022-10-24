import { RepoInfo } from "src/RepoInfo";

export type Repo = `${string}/${string}`;
export type GithubUrl = `https://github.com/${string}/${string}`;

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
  /**
   * If you are addressing a branch which you know to have discrete set of branches
   * then you can state them. This allows these branches to be used in a type strong
   * way as soon as the API is ready. Note that there are branches you express as
   * existing that in fact _do not_ an error will be thrown.
   */
  withBranches?: readonly string[];

}

export type GitSource = "github" | "bitbucket" | "gitlab";

export interface SitemapOptions {
  /**
   * the path in the repo where you should start looking for files
   * but if not stated it will start from the root.
   */
  path?: string;
  /**
   * Filter function which can test directory names; only those which pass
   * are recursed.
   */
  directoryFilter?: (dir: string) => boolean;
  /**
   * Filter function which tests whether the given file should be included in
   * the file names of the sitemap.
   */
  fileFilter?: (filename: string) => boolean;

  /**
   * The maximum depth which you want to traverse into the repo
   */
  depth?: number;
}

export interface SitemapFile {
  name: string;
  size: number;
  sha: string;
  download_url: string;
}

export interface SitemapDirectory {
  dir: string;
  files: SitemapFile[];
  children: SitemapDirectory[];
}

export interface Sitemap {
  options: SitemapOptions;
  root: SitemapDirectory;
}

export type RepoApi<R extends Repo, B extends string, S extends GitSource> = {
  repo: Readonly<R>,
  branch: Readonly<B>,
  source: Readonly<S>,
  defaultBranch: Readonly<string>;

  /**
   * When first instantiating this API you will be moved into
   * the _default_ branch unless you expressed it explicitly.
   *
   * For some API calls the branch doesn't matter but if you need
   * to switch to another for those where it does you can do so
   * with this call.
   */
  switchToBranch<NB extends string>(branch: NB): RepoApi<R, NB, S>;

  /**
   * Builds a hierarchical sitemap structure of files in
   * the repo.
   *
   * Use the provided options dictionary to refine the set of files/
   * directories you are interested in.
   *
   * @param options SitemapOptions
   */
  buildSitemap(options: SitemapOptions): any;

  commits(): any;
  metaData(): any;
  branches(): any;
  getFileContent(): Promise<string | undefined>;
  getReadme(): Promise<string | undefined>;

  getOrgsRepos(): Promise<any[]>
}
