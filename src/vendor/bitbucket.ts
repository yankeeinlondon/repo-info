
import { RepoProvider } from "src/types";

const api: RepoProvider = (_fetch) => ({
  getRepoMeta(_repo, _options) {
    throw new Error("not implemented");
  },
  getFileContent(_repo, _branch, _filepath) {
    throw new Error("not implemented");
  },
  getRepoBranches(_repo, _options) {
    throw new Error("not implemented");
  },
  getReadme(_repo, _branch) {
    throw new Error("not implemented");
  },
  getCommits(_repo, _qp = {}) {
    // const url = `${BITBUCKET_API_BASE}/repositories/${repo}/commits/` as const;
    // const mapper = mapTo
    //   .oneToOne()
    //   .map<BitbucketCommit, RepoCommit>(i => i);
    // return fetch(url, "list", mapper, {qp});
    throw new Error("not implemented");
  },

  getReposInOrg(_org, _options) {
    throw new Error("not implemented");
  },

  getContentInRepo(_repo, _branch, _path) {
    throw new Error("not implemented");
  },

  buildSitemap(repo, branch, path, _options = {}) {
    throw new Error("not implemented");
  },
  getIssues(_repo, _options) {
    throw new Error("not implemented");
  },
});

export default api;