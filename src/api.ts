import { AlphaNumeric, dictArr } from "inferred-types";
import { AlwaysFetchApi, CommitsApi, CoreApi, GitSource, ReadmeApi, ReadmeMarkdown, Repo, RepoApi, RepoCache, RepoCommit, RepoOptions, RepoProvider } from "./types";


export const repoApi = async <R extends Readonly<Repo>, B extends string, S extends GitSource, W extends string = "none">(
  repo: R,
  branch: B,
  source: S,
  provider: RepoProvider, 
  cache: RepoCache<W>, 
  options: RepoOptions<B, any, any, any>
): Promise<RepoApi<R, B, S, W>> => {
  const organization = repo.split("/")[1] as AlphaNumeric;

  const core: CoreApi<R, B, S> = {
    repo,
    organization,
    branch,
    source,
    defaultBranch: cache.meta.default_branch,
    meta: cache.meta,
    listOfBranches: cache.branches.map(b => b.name),
    branchInfo: dictArr(...cache.branches).toLookup("name"),
  };

  const fetchApi: AlwaysFetchApi = {
    getFileContent(filepath) {
      return provider.getFileContent(repo, branch, filepath);
    },
    buildSitemap(root, options = {}) {
      return provider.buildSitemap(repo, branch, root, options);
    },
    getReposInOrg(org = organization, options = {}) {
      return provider.getReposInOrg(org, options);
    },

    getContentInRepo(path) {
      return provider.getContentInRepo(repo, branch, path);
    },
  };

  const commits = (
    cache.cached.includes("commits")
    ? {
      commits: cache.commits as readonly RepoCommit[],
      async getMoreCommits() {
        options = {
          ...options,
          withCommits: { page: options.withCommits && typeof options?.withCommits === "object" 
            ? options.withCommits?.page + 1 || 2
            : 2
          }
        };
        const more = await provider.getCommits(repo, options.withCommits);

        return { page: options.withCommits.page, commits: more };
      }
    } as CommitsApi<true>
    : {
      async getCommits(o) {
        const commits: readonly RepoCommit[] = await provider.getCommits(repo, o || {});

        return commits;
      }
    } as CommitsApi<false>
  ) as CommitsApi<W extends "commits" ? true : false>;

  const readmeFile = cache.cached.includes("readme")
    ? cache.readme || await provider.getReadme(repo, branch)
    : undefined;

  const readme = (
    cache.cached.includes("readme")
      ? {
        readme: readmeFile as ReadmeMarkdown
      }
      : {
        getReadme() {
          return provider.getReadme(repo, branch);
        }
      }
  ) as ReadmeApi<W extends "readme" ? true : false>;

  return {
    ...core,
    ...fetchApi,
    ...commits,
    ...readme
  } as RepoApi<R,B,S,W>;
};
