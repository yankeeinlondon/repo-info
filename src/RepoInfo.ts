import {  literal,  UnionToTuple } from "inferred-types";
import type { Repo, Url } from "src/types/general";
import { f } from "src/f";
import { bitbucket, github, gitlab } from "src/vendor/index";
import { extractRepoAndSource, getEnv } from "./utils";
import { ApiWith,  RepoApi,  RepoCache, RepoConfig, RepoOptions, RepoProvider, ToRepo, ToSource } from "./types/api-types";
import { repoApi } from "./api";
import { RepoCommitOptions } from "./types";

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

  if(!token) {
    console.warn(`No auth token was found in ENV or passed into RepoInfo in the options hash; it is recommended that this be provided as anonymous clients have highly restricted caps. Available ENV properties were: ${Object.keys(import.meta.env || {})}`);
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
    case "bitbucket": {
      provider = bitbucket(fetch);
      break;
    }
    case "gitlab": {
      provider = gitlab(fetch);
      break;
    }

    default: {
      throw new Error(`The git provider ${source} is not currently implemented!`);
    }
  }

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
                : options.withCommits
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
    ToSource<TRep>, 
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



