# Repo Info

## Installation

From the shell:

```bash
# choose your favorite package manager
pnpm install @yankeeinlondon/repo-info
```

## Usage

### Get The API surface

First you want to get a `repo` based API:

```ts
import RepoInfo from "repo-info";

// defaults to assuming a github repo
const repo = await RepoInfo("org/repo");
// you can use the full URL if you prefer
const alt = await RepoInfo("https://github.com/org/repo");
```

> Note: currently we only support Github but the intent is to be appropriately abstracted to support
> other providers like **Gitlab** and **Bitbucket**

### Partial Application

A lot of time, it's useful to lazy load what you want to do but not start the _doing_ until later. This is in fact the default behavior of this library:

```ts
//  RepoConfig<"org/repo", "default-branch", "github", "none">
const repo = RepoApi("org/repo");
```

This _synchronous_ operation simply configures what you'll want to do later with returned configuration object's `load()` method:

```ts
// RepoApi<"org/repo", "default-branch", "github", "none">
const info = await repo.load();
```

Now the `info` hash provides a combination of useful information about the repo and it's branches but also an API surface which let's you explore further. It's all strongly typed with comments for the types in most cases so just use the surface as your documentation.

> Note: if you thing lazy-loading is just _lazy_ then you can skip it by setting the option `{ loadNow: true }`.

### Preloading More Meta

When a **RepoInfo** type is created it pre-loads some information about the repo. By default this is just the following:

- Repo Meta
- Branch Info

Beyond that it provides an API surface for things like:

- `getReposInOrg()`
- `getReadme()`
- `getContentInRepo()`
- `getCommits()`
- `buildSitemap()`

While that let's you extend beyond the base information you'll always get, you may know that you _always_ want certain information loaded along with the repo meta and branch info. This is possible via the initial options hash provided:

```ts
// RepoInfo<"org/repo", "default-branch", "github", "readme">
const api = await RepoInfo("org/repo", { withReadme: true, loadNow: true })
```

In this case, stating that you know you'll want info on the repo's README.md file changes the surface of the API. You'll no longer have a `getReadme()` method but instead a `readme` property
which is populated with the `ReadmeMarkdown` type.

Not all endpoints are yet supported in this manner but you'll see in your editor which ones are just by exploring the options hash of RepoInfo.

### Branches

Up to now all examples have shown us not expressing an explicit _branch_ we want to default to but by doing so we've ended seeing that our "type" includes reference to _default-branch_. Since we always get the repo's meta data and it knows which branch is the the "default branch" we can automatically set this for you but you can set it explicitly too if you prefer:

```ts
// RepoConfig<"org/repo", "develop", "github", "none">
const api = await RepoInfo("org/repo", { branch: "develop" });
```

It will trust your knowledge of the actual branches when lazy loading the config but if when you load to an active API surface if we find that the branch doesn't exist then an error will be thrown.

## Contributing

Happy for people to contribute with PRs. This repo's API _approach_ should be maintained but there is definitely plans to to _additively_ add other endpoints to the API surface when time permits and most self-evidently this library is intended to abstract the **git** vendor but currently is only implemented for **github** though it is _structured_ for this abstraction I am VERY happy if someone takes on **Bitbucket** and/or **Gitlab** which I am not currently working that much.

One thing to bear in mind if you're considering contributing, I expect the following things:

- unit tests in a similar level of granularity as what are already here to show your feature's contribution working along with any edge cases you're aware of
- strong typing which preserves type literals where possible
