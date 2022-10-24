import type { GitSource, Repo, RepoApi } from "src/types/general";
import { GithubRepoMeta } from "./api/github/getRepo";
import { GithubBranch } from "./api/github/getRepoBranches";

export const repoApi = <R extends Readonly<Repo>, B extends string, S extends GitSource>(
  repo: R,
  branch: B,
  source: S,
  auth: [user: string | undefined, token: string | undefined],
  branches: Record<string, GithubBranch>,
  meta: GithubRepoMeta
): RepoApi<R,B,S> => {
  
  return {
    repo,
    branch,
    source,
    defaultBranch: meta.default_branch,

    switchToBranch(branch) {
      return repoApi(repo, branch, source, auth, branches, meta) as RepoApi<R, typeof branch, S>;
    },

    buildSitemap(options) {

    },

    commits() {
      // 
    },

    metaData() {

    },
    branches() {

    },

    async getFileContent() {
      return ""
    },

    async getReadme() {
      return "";
    },

    async getOrgsRepos() {
      return [];
    }



  }
}