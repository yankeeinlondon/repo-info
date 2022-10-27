import { AlphaNumeric } from "inferred-types";
import type { Repo, GithubUrl, RepoOptions, GitSource, RepoApi, RepoProvider } from "src/types/general";
import { isGithubHrl } from "src/type-guards";
import { f } from "src/f";
import { github } from "src/api/index";
import { GithubBranch, GithubRepoMeta } from "src/types/req-resp";
import { getEnv } from "./utils";


export const repoApi = <R extends Readonly<Repo>, B extends string, S extends GitSource>(
  repo: R,
  branch: B,
  source: S,
  branches: {[key: string]: GithubBranch},
  meta: GithubRepoMeta,
  provider: RepoProvider
): RepoApi<R,B,S> => {
  const organization = repo.split("/")[1] as AlphaNumeric;
  
  return {
    repo,
    organization,
    branch,
    source,
    defaultBranch: meta.default_branch,
    meta,
    listOfBranches: Object.keys(branches),
    branchInfo: branches,

    switchToBranch(b) {
      return repoApi(repo, b, source, branches, meta, provider);
    },

    getCommits(options = {}) {
      return provider.getCommits(repo, options);
    },
    getFileContent(filepath) {
      return provider.getFileContent(repo, branch, filepath);
    },
    getReadme() {
      return provider.getReadme(repo, branch);
    },

    getReposInOrg(org = organization, options = {}) {
      return provider.getReposInOrg(org, options);
    },

    getContentInRepo(path) {
      return provider.getContentInRepo(repo, branch, path);
    },

    buildSitemap(root, options = {}) {
      return provider.buildSitemap(repo, branch, root, options);
    },
    
  };
};

/**
 * Configure an API for a Repo you want to interrogate.
 * 
 * @param repo the `org/name` or `URL` of the repo you want an API for
 */
export const RepoInfo = async <R extends Repo | GithubUrl, B extends string = "default-branch">(repo: R, branch?: B, options: RepoOptions = {} as RepoOptions) => {
  const env = getEnv();
  const r: Repo = isGithubHrl(repo)
    ? repo.replace("https://github.com/", "") as R
    : repo;

  const source: GitSource = "github";

  const [username, token] = [
    (
      options.auth?.user || 
      env.VITE_GITHUB_USER || 
      env.GITHUB_USER || 
      env.GH_USER || 
      env.VITE_GH_USER || 
      undefined
    ) as string | undefined,
    (
      options.auth?.token || 
      env.GITHUB_TOKEN || 
      env.VITE_GITHUB_TOKEN || 
      env.GH_TOKEN || 
      env.VITE_GH_TOKEN || 
      undefined
    ) as string | undefined
  ];

  if(!username || !token) {
    console.warn(`No auth user and/or token was found in ENV or passed into RepoInfo in the options hash; it is recommended that this be provided as anonymous clients have highly restricted caps.`);
  }

  const fetch = f({
    username,
    password: token,
  });
  let provider: RepoProvider;
  switch(source) {
    case "github": {
      provider = github(fetch);
      break;
    }
    default: {
      throw new Error(`The git provider ${source} is not currently implemented!`);
    }
  }

  const meta = await provider.getRepoMeta(repo, {username, password: token});
  const branches = await provider.getRepoBranches(repo, {username, password: token});
  const b = branch || meta.default_branch;

  return repoApi(r as R, b, source, branches, meta, provider) as RepoApi<R, B, typeof source>;
};



