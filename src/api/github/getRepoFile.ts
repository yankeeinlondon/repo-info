import { Repo } from "src/types/general";
import { fetchError } from "src/utils";
import fetch from "node-fetch";

/**
 * Gets the raw content from a file in a github repo
 *
 * @param repo repo name in form of `owner/name`
 * @param filepath path from root of repo to the file (including file extension)
 * @param branch optionally specify a branch; will default to repo's default branch if not specified
 */
export async function getRepoFile(
  repo: Repo,
  filepath: string,
  branch: string
) {
  const url = `https://raw.githubusercontent.com/${repo}/${branch}/${filepath}`;
  const res = await fetch(url);
  if(res.ok) {
    const content = res.text();
    return content
  } else {
    throw fetchError(`Problems getting the file contents of "${filepath}" from branch "${branch}"`, url, res);
  }
}
