import type {
  FetchApi,
  FlatSitemap,
  GithubBranch,
  GithubCommit,
  GithubContent,
  GithubRepoIssue,
  GithubRepoMeta,
  ReadmeMarkdown,
  Repo,
  RepoBranch,
  RepoCommit,
  RepoContent,
  RepoFile,
  RepoIssue,
  RepoMetadata,
  RepoProvider,
  RepoSubmodule,
  RepoSymLink,
  Sitemap,
  SitemapDirectory,
  SitemapOptions,
  Url,
} from "src/types";
import { join } from "pathe";
import { GITHUB_API_BASE } from "src/constants";
import { identity } from "src/utils";

function flattenSitemap(smd: SitemapDirectory): RepoFile[] {
  let flat: RepoFile[] = [...smd.files];

  for (const dir of smd.subDirectories) {
    // recurse
    for (const subDir of dir.subDirectories) {
      flat = [...flat, ...flattenSitemap(subDir)];
    }
  }

  return flat;
}

/**
 * Map Github's repo meta to the generalized `RepoMetadata`
 */
const metaMapper = mapTo.oneToOne().map<GithubRepoMeta, RepoMetadata>(r => r);

/**
 * recursively moves though repo content on behalf of the sitemap functionality
 */
async function crawler<F extends FetchApi>(fetch: F, repo: Repo, branch: string, path: string, options: SitemapOptions): Promise<SitemapDirectory> {
  // ensure filters exist
  const fileFilter = options.fileFilter || (() => true);
  const directoryFilter = options.directoryFilter || (() => true);
  // get directory content at path

  const content = await api(fetch).getContentInRepo(repo, branch, path);
  let { files, subDirectories } = content;
  // filter
  files = files.filter(i => fileFilter(i.filename, i));
  subDirectories = subDirectories.filter(i => directoryFilter(i, content));
  // container for current directory structure
  const dir: SitemapDirectory = {
    dir: path,
    files,
    subDirectories: [],
  };
  // recurse into sub directories
  if (subDirectories.length > 0) {
    const waitFor: Promise<SitemapDirectory>[] = [];
    for (const child of subDirectories) {
      const subDirectory = join(path, `/${child}`);
      waitFor.push(crawler(fetch, repo, branch, subDirectory, options));
    }
    dir.subDirectories = await Promise.all(waitFor);
  }

  return dir;
}

function rawUrl(repo: Repo, branch: string, filepath: string) {
  return `https://raw.githubusercontent.com/${repo}/${branch}/${filepath}` as Url;
}

function editorUrl(repo: Repo, branch: string, filepath: string) {
  return `https://github.com/${repo}/blob/${branch}/${filepath}` as Url;
}

const api: RepoProvider = fetch => ({
  getRepoMeta(repo, options) {
    const url = `${GITHUB_API_BASE}/repos/${repo}`;
    return fetch(url, "singular", metaMapper, options);
  },
  getFileContent(repo, branch, filepath) {
    const url = rawUrl(repo, branch, filepath);
    const mapper = mapTo<string, string>(m => [m]);
    return fetch(url, "singular", mapper, { as: "text" });
  },
  async getRepoBranches(repo, options) {
    const url = `${GITHUB_API_BASE}/repos/${repo}/branches`;
    const mapper = mapTo.oneToOne().map<GithubBranch, RepoBranch>(b => b);
    return fetch(url, "list", mapper, options);
  },
  async getReadme(repo, branch) {
    const url = rawUrl(repo, branch, "README.md") as Url;
    const readme: ReadmeMarkdown = {
      content: "",
      exists: false,
      rawUrl: rawUrl(repo, branch, "README.md"),
      editorUrl: editorUrl(repo, branch, "README.md"),
    };
    const mapper = mapTo
      .oneToOne()
      .map<string, ReadmeMarkdown>(i => ({
        ...readme,
        exists: true,
        content: i,
      }),
      );
    return fetch(url, "singular", mapper, { on404: readme, as: "text" });
  },

  getCommits(repo, options) {
    const url = `${GITHUB_API_BASE}/repos/${repo}/commits` as const;
    // const reqMapper = mapTo<RepoCommitsRequest, GithubCommitsQueryParams>(i => [i]);
    const respMapper = mapTo<GithubCommit, RepoCommit>(i => [i]);
    return fetch(
      url,
      "list",
      respMapper,
      options || {},
    );
  },

  getReposInOrg(org, options) {
    const url = `${GITHUB_API_BASE}/orgs/${org}/repos` as const;
    const mapper = identity<GithubRepoMeta>();
    return fetch(
      url,
      "list",
      mapper,
      options,
    );
  },

  getContentInRepo(repo, branch, path) {
    const url
      = `${GITHUB_API_BASE}/repos/${repo}/contents/${path}?ref=${branch}` as const;

    const files = mapTo<GithubContent, RepoFile>(i =>
      i?.type === "file"
        ? [{
            kind: "file",
            filename: i.name,
            filepath: i.path.replace(i.name, ""),
            sha: i.sha,
            size: i.size,
            url: i.html_url ? i.html_url as Url : null,
            raw_url: i.download_url ? i.download_url as Url : null,
          }]
        : [],
    );

    const subDirectories = mapTo<GithubContent, string>(i =>
      i?.type === "dir"
        ? [i.name]
        : [],
    );

    const symlink = mapTo<GithubContent, RepoSymLink>(i =>
      i?.type === "symlink"
        ? [{
            kind: "symlink",
            sha: i.sha,
          }]
        : [],
    );

    const submodule = mapTo<GithubContent, RepoSubmodule>(i =>
      i?.type === "submodule"
        ? [{
            kind: "submodule",
            sha: i.sha,
            name: i.name,
          }]
        : [],
    );

    const mapper = mapTo
      .manyToOne()
      .map<GithubContent, RepoContent>((i) => {
        return {
          dir: path,
          files: files(i),
          subDirectories: subDirectories(i),
          symlinks: symlink(i),
          submodules: submodule(i),
        };
      });

    return fetch(url, "singular", mapper, {});
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
          files: flattenSitemap(root),
        };

        return flatMap;
      },
    };

    return sitemap;
  },

  getIssues(repo, options) {
    const url = `${GITHUB_API_BASE}/repos/${repo}/issues` as const;
    const mapper = mapTo.oneToOne().map<GithubRepoIssue, RepoIssue>(i => i);
    return fetch(
      url,
      "list",
      mapper,
      options,
    );
  },
});

export default api;
