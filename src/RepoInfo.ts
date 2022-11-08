import {  literal,  UnionToTuple } from "inferred-types";
import {  GitSource, Repo, Url } from "src/types/general";
import { fetchWrapper } from "src/fetchWrapper";
import { bitbucket, github, gitlab } from "src/vendor/index";
import { extractRepoAndSource, getEnv } from "./utils";
import { ApiWith,  RepoApi,  RepoCache, RepoConfig, RepoOptions,  RepoProvider,  ToRepo, ToSource } from "./types/api-types";
import { repoApi } from "./api";
import {  RepoCommitOptions } from "./types";

/**
 * Configure an API for a Repo you want to interrogate.
 * 
 * @param repoRep the `org/name` or `URL` of the repo you want an API for
 */
export const RepoInfo = <
  TRep extends Repo | Url, 
  TBranch extends string = "default-branch", 
  TReadme extends boolean = false, 
  TCommits extends boolean | RepoCommitOptions = false,
  TLoadNow extends boolean = false
>(
  repoRep: TRep,
  options: RepoOptions<TBranch,TReadme,TCommits,TLoadNow> = {} as RepoOptions<TBranch, TReadme,TCommits, TLoadNow>
) => {
  const env = getEnv();
  const {repo, source} = extractRepoAndSource(repoRep);
  let targetTokens: string[];
  // The higher order provider function to be used
  // once we hopefully have some auth data.
  let p: RepoProvider;

  switch(source) {
    case "github": {
      targetTokens = ["GITHUB_TOKEN", "VITE_GITHUB_TOKEN", "GH_TOKEN", "VITE_GH_TOKEN"];
      p = github;
      break;
    }
    case "bitbucket": {
      targetTokens = ["BITBUCKET_TOKEN", "VITE_BITBUCKET_TOKEN"];
      p = bitbucket;
      break;
    }
    case "gitlab": {
      targetTokens = ["GITLAB_TOKEN", "VITE_GITLAB_TOKEN"];
      p = gitlab;
      break;
    }
    case "unknown": {
      throw new Error(`The host (aka., Github, Bitbucket, etc.) of the specified repo could not be determined!`);
    }
  }

  // the ENV variable with a token in it
  const tokenFound = options.auth?.token || targetTokens.find(t => env[t] && env[t].length > 0);

  if(!tokenFound) {
    console.warn(`No auth token was found in local ENV (or passed into RepoInfo in the options hash). It is strongly recommended that this be provided as anonymous clients have highly restricted caps. For a repo hosted on ${source} we look in the following ENV vars:\n  -${targetTokens.join("\n  - ")}`);
  }

    // build fetch wrapper
    const fetch = fetchWrapper({
      ...(tokenFound ? {token: env[tokenFound]} : {}),
    });
    // give provider the fetch wrapper
    const provider = p(fetch);

  const cached = (
    options.withCommits 
      ? options.withReadme
        ? ["readme", "commits"]
        : ["commits"] 
      : options.withReadme
        ? ["readme"]
        : ["none"]
  ) as unknown as UnionToTuple<ApiWith<TReadme, TCommits>>;

  const buildApi = async() => {
    const meta = await provider.getRepoMeta(repo);
    const branches = await provider.getRepoBranches(repo);
    const b = options.branch || literal(meta.default_branch);
    
    const readme = options.withReadme !== false ? await provider.getReadme(repo, b) : undefined;

    const cache = {
      cached,
      meta,
      branches,
      ...(options.withCommits && options.withCommits !== false 
          ? {
            commits: await provider.getCommits(repo, options.withCommits === true 
                ? {} 
                : { qp: options.withCommits }
            )
          }
          : {}
      ),
      ...(options.withReadme !== false
        ? { readme }
        : {}
      )
    } as unknown as RepoCache<ApiWith<TReadme, TCommits>> ;

    return repoApi(repo, b, source, provider, cache, options);
  };


  const repoConfig: RepoConfig<
    ToRepo<TRep>,
    TBranch, 
    GitSource, 
    ApiWith<TReadme, TCommits>
  > = {
    repo,
    branch: (options?.branch || literal("default-branch")) as Readonly<TBranch>,
    source,
    cached,

    load: () => {
      return  buildApi() as unknown as Promise<
        RepoApi<ToRepo<TRep>, TBranch, ToSource<TRep>, ApiWith<TReadme, TCommits>>
      >;
    },
  };


  const rtn = options.loadNow !== true
    ? repoConfig
    : buildApi();

  return rtn as TLoadNow extends false
    ? RepoConfig<ToRepo<TRep>, TBranch, ToSource<TRep>, ApiWith<TReadme, TCommits>> 
    : Promise<RepoApi<ToRepo<TRep>, TBranch, ToSource<TRep>, ApiWith<TReadme, TCommits>>>;
};



