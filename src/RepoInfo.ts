import type { Repo, GithubUrl, RepoOptions, GitSource } from "src/types/general";
import { isGithubHrl } from "src/type-guards";
import { getRepoBranches, GithubBranch } from "./api/github/getRepoBranches";
import { getRepo, GithubRepoMeta } from "./api/github/getRepo";
import { repoApi } from "src/api";

export const RepoInfo = async <R extends Repo | GithubUrl>(repo: R, options: RepoOptions = {}) => {
  const r: Repo = isGithubHrl(repo)
    ? repo.replace("https://github.com/", "") as R
    : repo;

  const source: GitSource = "github";

  const [user, token] = [
    (options.auth?.user || import.meta?.env?.GITHUB_USER || import.meta?.env?.GH_USER || undefined) as string | undefined,
    (options.auth?.token || import.meta?.env?.GITHUB_TOKEN || import.meta?.env?.GH_TOKEN || undefined) as string | undefined
  ]

  if(!user || !token) {
    console.warn(`No auth user and/or token was found in ENV or passed into RepoInfo in the options hash; it is recommended that this be provided or you will likely run into .`);
  }

  const meta = await getRepo(repo);

  const gather = [
    getRepoBranches(repo).then(b => b as Record<string, GithubBranch>),
    getRepo(repo).then(r => r as GithubRepoMeta)
  ];

  const [branches, m] = await Promise.all(gather);

  return repoApi(r as R, meta.default_branch, source, [user, token], branches, meta);
}
