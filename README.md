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

### Use the API surface

At the point the API surface has been created we have already pulled the basics of the repo's meta data as well as all the _branches_ which exist on the given repo.

- `getReposInOrg()`
- `getReadme()`
- `getContentInRepo()`
- `getCommits()`
- `buildSitemap()`

All types have comments and are hopefully fully self-documented.

### Branches

The behavior of the API surface is _branch specific_ but in the examples so far we have not expressed which branch we want to be in. This is because, if you do not specify we will determine from the repo's meta information what the "default branch" and put you into that. This helps you hopefully move into the appropriate default without having to first investigate what that is.

That said, you'll find the if you want to explicitly state the branch that's simply a matter of setting that property in the options hash. So if I wanted to make sure that I moved to the `feature/foobar` branch you'd do this with:

```ts
const repo = await RepoInfo("org/repo", { branch: "feature/foobar" });
```

### More Info Upfront

By default when you first instantiate your repo info you will be getting:

- repo meta
- repo branches

If know you want _additional_ info up front then you can express that in the options parameter:

```ts
const repo = await RepoInfo("org/repo", {
    withReadme: true,
    withCommits: true,
    withSitemap("/docs", { fileFilter: files }),
})
```

Expressing this additional content will give you a slightly different API surface. For instance, since you asked for commits, there is now a `commits` property on the API with this data ready for you. In addition, the `getCommits()` which would typically a part of the API is replaced with `refreshCommits()` which will return you to the same API surface with an updated set of commits.

### Partial Application

Typically we do a bit of async work when you initiate your `RepoInfo` api but if you want to just configure it but not actually make any network calls yet you can do so with:

```ts
//  RepoApiLoader<"org/repo", "default-branch", "github">
const repo = RepoApi("org/repo", { configOnly: true });
```

Now this variable is fully configured and can be activated with:

```ts
const info = await repo.load();
```

## Contributing

Happy for people to contribute with PRs. This repo's API _approach_ should be maintained but there is definitely plans to to _additively_ add other endpoints to the API surface when time permits and most self-evidently this library is intended to abstract the **git** vendor but currently is only implemented for **github** though it is _structured_ for this abstraction I am VERY happy if someone takes on **Bitbucket** and/or **Gitlab** which I am not currently working that much.
