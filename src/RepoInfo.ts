import type { Repo, GithubUrl, RepoOptions, GitSource, RepoApi } from "src/types/general";
import { isGithubHrl } from "src/type-guards";
import { getRepoBranches  } from "./api/github/getRepoBranches";
import { getRepo  } from "./api/github/getRepo";
import { repoApi } from "src/api";
/**
 * Configure an API for a Repo you want to interrogate.
 * 
 * @param repo the `org/name` or `URL` of the repo you want an API for
 */
export const RepoInfo = async <R extends Repo | GithubUrl, B extends string = "default-branch">(repo: R, options: RepoOptions<B> = {} as RepoOptions<B>) => {
  const r: Repo = isGithubHrl(repo)
    ? repo.replace("https://github.com/", "") as R
    : repo;

  const source: GitSource = "github";

  const [username, token] = [
    (options.auth?.user || import.meta?.env?.GITHUB_USER || import.meta?.env?.GH_USER || undefined) as string | undefined,
    (options.auth?.token || import.meta?.env?.GITHUB_TOKEN || import.meta?.env?.GH_TOKEN || undefined) as string | undefined
  ]

  if(!username || !token) {
    console.warn(`No auth user and/or token was found in ENV or passed into RepoInfo in the options hash; it is recommended that this be provided or you will likely run into .`);
  }

  const meta = await getRepo(repo, { username, password: token });
  const branch = meta.default_branch;
  const branches = await getRepoBranches(repo);

  return repoApi(r as R, branch, source, [username, token], branches, meta) as RepoApi<R, B, typeof source>;
}

