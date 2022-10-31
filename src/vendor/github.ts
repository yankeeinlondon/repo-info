import { mapTo } from "inferred-types";
import { join } from "pathe";
import { GITHUB_API_BASE } from "src/constants";
import type { RepoProvider ,  FetchApi, Repo,  SitemapOptions,  GithubBranch, GithubContent, RepoMetadata, FlatSitemap, Sitemap, SitemapDirectory, RepoFile, GithubRepoMeta, RepoCommitsRequest, GithubCommitsQueryParams} from "src/types";
import { tightenUpContent } from "./github/content";

const flattenSitemap = (smd: SitemapDirectory): RepoFile[] => {
  let flat: RepoFile[] = [...smd.files];

  for (const dir of smd.subDirectories) {
    // recurse
    for (const subDir of dir.subDirectories) {
      flat = [...flat, ...flattenSitemap(subDir)];
    }
  }

  return flat;
};

const metaMapper = mapTo<GithubRepoMeta, RepoMetadata>(r => [{...r}]);

/**
 * recursively moves though repo content on behalf of the sitemap functionality
 */
const crawler = async <F extends FetchApi<any, any>>(
  fetch: F, 
  repo: Repo, 
  branch: string, 
  path: string, 
  options: SitemapOptions
): Promise<SitemapDirectory> => {
  console.log("crawler:", path);
  
  // ensure filters exist
  const fileFilter = options.fileFilter || (() => true);
  const directoryFilter = options.directoryFilter || (() => true);
  // get directory content at path
  // eslint-disable-next-line no-use-before-define
  const content = await api(fetch).getContentInRepo(repo, branch, path);
  let { files, subDirectories } = content;
  // filter
  files = files.filter(i => fileFilter(i.filename, i));
  subDirectories = subDirectories.filter(i => directoryFilter(i, content));
  // container for current directory structure
  const dir: SitemapDirectory = {
    dir: path,
    files,
    subDirectories: []
  };
  // recurse into sub directories
  if(subDirectories.length > 0) {
    const waitFor: Promise<SitemapDirectory>[] = [];
    for (const child of subDirectories) {
      const subDirectory = join(path, `/${child}`);
      waitFor.push(crawler(fetch, repo, branch, subDirectory, options));
    }
    dir.subDirectories = await Promise.all(waitFor);
  }

  return dir;
};

const rawUrl = (repo: Repo, branch: string, filepath: string) => 
  `https://raw.githubusercontent.com/${repo}/${branch}/${filepath}`;

const editorUrl = (repo: Repo, branch: string, filepath: string) => 
  `https://github.com/${repo}/blob/${branch}/${filepath}`;

const api = <F extends FetchApi<any, any>>(fetch: F) => ({
  getRepoMeta(repo, _options) {
    const url = `${GITHUB_API_BASE}/repos/${repo}`;
    return fetch(url, "json", `Problems getting meta data on repo.`);
  },
  getFileContent(repo, branch, filepath) {
    const url = rawUrl(repo, branch, filepath);
    return fetch(url, "text", `Issues getting file content for "${filepath}"`);
  },
  async getRepoBranches(repo, options) {
    const url = `${GITHUB_API_BASE}/repos/${repo}/branches`;
    const branches = await fetch(url, "json", `Issues getting the branches for the repo ${repo}`, options) as readonly GithubBranch[];
    return branches;
  },
  async getReadme(repo, branch) {
    try {
      const content: string = await api(fetch).getFileContent(repo, branch, "README.md");
      return {
        content,
        editorUrl: editorUrl(repo, branch, "README.md"),
        rawUrl: rawUrl(repo, branch, "README.md"),
        exists: true
      };
    } catch {
      return  {
        content: undefined,
        editorUrl: editorUrl(repo, branch, "README.md"),
        rawUrl: rawUrl(repo, branch, "README.md"),
        exists: false,
      };
    }
  },
  async getCommits(repo, options = {}) {
    const url = `${GITHUB_API_BASE}/repos/${repo}/commits` as const;
    const mapper = mapTo<RepoCommitsRequest, GithubCommitsQueryParams>(i => [i]);
    const resp = await fetch(url, "json", "Problems getting commits from repo.", mapper(options).pop());
    return resp;
  },

  async getReposInOrg(org, options) {
    const url = `${GITHUB_API_BASE}/orgs/${org}/repos` as const;
    
    const repos = await fetch(url, "json", `Problem getting repos from the organization "${org}".`, options);

    return repos.map(metaMapper);
  },

  async getContentInRepo(repo, branch, path) {
    const url = 
      `${GITHUB_API_BASE}/repos/${repo}/contents/${path}?ref=${branch}` as const;
    const resp: readonly GithubContent[] = await fetch(url, "json", `Problem getting content in the repo."`);
    
    return tightenUpContent(resp);
  },

  async buildSitemap(repo, branch, path, options = {}) {
    const root = await crawler(fetch, repo, branch, path, options);
    const sitemap: Sitemap = {
      repo,
      branch,
      root,
      flatten() {
        const flatMap: FlatSitemap = {
          repo,
          branch,
          path,
          files: flattenSitemap(root)
        };

        return flatMap;
      },
    };

    return sitemap;
  }
} as RepoProvider);

export default api;