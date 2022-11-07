import {  mapTo } from "inferred-types";
import { join } from "pathe";
import { GITHUB_API_BASE } from "src/constants";
import {  FetchApi, Repo,  SitemapOptions,  GithubBranch, GithubContent, RepoMetadata, FlatSitemap, Sitemap, SitemapDirectory, RepoFile, GithubRepoMeta, RepoCommitsRequest, GithubCommitsQueryParams, GithubRepoIssue, RepoIssue, RepoProvider, RepoBranch, ReadmeMarkdown, GithubCommit, RepoCommit, RespStructure, RepoContent, Url, RepoSymLink, RepoSubmodule} from "src/types";

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

/**
 * Map Github's repo meta to the generalized `RepoMetadata`
 */
const metaMapper = mapTo<GithubRepoMeta, RepoMetadata>(r => [{...r}]);

/**
 * recursively moves though repo content on behalf of the sitemap functionality
 */
const crawler = async <F extends FetchApi>(
  fetch: F, 
  repo: Repo, 
  branch: string, 
  path: string, 
  options: SitemapOptions
): Promise<SitemapDirectory> => {
  
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

const api: RepoProvider = (fetch) => ({
  getRepoMeta(repo, options) {
    const url = `${GITHUB_API_BASE}/repos/${repo}`;
    return fetch(url, RespStructure.obj, metaMapper, options);
  },
  getFileContent(repo, branch, filepath) {
    const url = rawUrl(repo, branch, filepath);
    const mapper = mapTo<string, string>(m => [m]);
    return fetch(url, RespStructure.text, mapper);
  },
  async getRepoBranches(repo, options) {
    const url = `${GITHUB_API_BASE}/repos/${repo}/branches`;
    const mapper = mapTo<GithubBranch, RepoBranch>(b => [b]);
    return fetch(
      url, 
      RespStructure.array, 
      mapper, 
      options
    );
  },
  async getReadme(repo, branch) {
    try {
      const content: string = await api(fetch).getFileContent(repo, branch, "README.md");
      return {
        content,
        editorUrl: editorUrl(repo, branch, "README.md"),
        rawUrl: rawUrl(repo, branch, "README.md"),
        exists: true
      } as ReadmeMarkdown;
    } catch {
      return  {
        content: undefined,
        editorUrl: editorUrl(repo, branch, "README.md"),
        rawUrl: rawUrl(repo, branch, "README.md"),
        exists: false,
      } as ReadmeMarkdown;
    }
  },

  async getCommits(repo, options = {}) {
    const url = `${GITHUB_API_BASE}/repos/${repo}/commits` as const;
    const reqMapper = mapTo<RepoCommitsRequest, GithubCommitsQueryParams>(i => [i]);
    const respMapper = mapTo<GithubCommit, RepoCommit>(i => [i]);
    const resp = await fetch<GithubCommit[]>(
      url, 
      RespStructure.array,
      reqMapper,
      options
    );
    return resp.flatMap(respMapper);
  },

  async getReposInOrg(org, options) {
    const url = `${GITHUB_API_BASE}/orgs/${org}/repos` as const;
    return await fetch(
      url,
      RespStructure.obj,
      metaMapper,
      options
    );
  },

  async getContentInRepo(repo, branch, path) {
    const url = 
      `${GITHUB_API_BASE}/repos/${repo}/contents/${path}?ref=${branch}` as const;

    const files = mapTo<GithubContent, RepoFile>(i => 
      i?.type === "file"
      ?  [{
          kind: "file",
          filename: i.name,
          filepath: i.path.replace(i.name, ""),
          sha: i.sha,
          size: i.size,
          url: i.html_url ? i.html_url as Url : null,
          raw_url: i.download_url ? i.download_url as Url : null
      }]
      : []
    );

    const subDirectories = mapTo<GithubContent, string>(i => 
      i?.type === "dir"
        ? [i.name]
        : []
    );

    const symlink = mapTo<GithubContent, RepoSymLink>(i => 
      i?.type === "symlink" 
        ? [{
          kind: "symlink",
          sha: i.sha
        }]
        : []
    );

    const submodule = mapTo<GithubContent, RepoSubmodule>(i => 
      i?.type === "submodule"
        ? [{
          kind: "submodule",
          sha: i.sha,
          name: i.name
        }]
        : []
    );

    const mapper = mapTo
      .manyToOne()
      .map<GithubContent, RepoContent>(i => {

      return {
        dir: path,
        files: files(i),
        subDirectories: subDirectories(i),
        symlinks: symlink(i),
        submodules: submodule(i)
      };
    });

    return fetch(url, RespStructure.array, mapper);
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
  },

  async getIssues(repo, options = {}) {
    const url = `${GITHUB_API_BASE}/repos/${repo}/issues` as const;
    const mapper = mapTo<GithubRepoIssue, RepoIssue>(i => [i]);
    const resp: readonly GithubRepoIssue[] = await fetch(url, "json", "Problem getting content in the repo.", options);

    return resp.flatMap(mapper) as readonly RepoIssue[];
  }
});

export default api;