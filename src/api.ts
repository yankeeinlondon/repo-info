import type { GitSource, Repo, RepoApi } from "src/types/general";
import { GithubBranch } from "./api/github/getRepoBranches";
import { GithubRepoMeta } from "./types/req-resp";

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

    switchToBranch(b) {
      return repoApi(repo, b, source, auth, branches, meta);
    },

    buildSitemap(options) {

    },

    getCommits() {
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