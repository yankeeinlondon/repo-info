# Repo Info

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

> Note: currently we only support Github but the intent is to be appopriately abstracted to support
> other providers like **Gitlab** and **Bitbucket**

### Use the API surface

At the point the API surface has been created we have already pulled the basics of the repo's meta data as well as all the _branches_ which exist on the given repo.

- `getReposInOrg()`
- `getReadme()`
- `getContentInRepo()`
- `getCommits()`
- `buildSitemap()`

All types have comments and are hopefully fully self-documented.
