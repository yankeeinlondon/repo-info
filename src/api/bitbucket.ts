import { FetchApi,  RepoProvider } from "src/types";

const api = <F extends FetchApi<any, any>>(_fetch: F) => ({
  getRepoMeta(_repo, _options) {
    throw new Error("not implemented");
  },
  getFileContent(_repo, _branch, _filepath) {
    throw new Error("not implemented");
  },
  async getRepoBranches(_repo, _options) {
    throw new Error("not implemented");
  },
  async getReadme(_repo, _branch) {
    throw new Error("not implemented");
  },
  async getCommits(_repo, _options = {}) {
    throw new Error("not implemented");
  },

  async getReposInOrg(_org, _options) {
    throw new Error("not implemented");
  },

  async getContentInRepo(_repo, _branch, _path) {
    throw new Error("not implemented");
  },

  async buildSitemap(repo, branch, path, _options = {}) {
    throw new Error("not implemented");
  }
} as RepoProvider);

export default api;