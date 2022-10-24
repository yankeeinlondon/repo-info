import { Repo } from "src/types/general";
import { getRepoFile } from "./getRepoFile";


/** returns the markdown text in the README.md file in the root of a repo */
export async function getRepoReadme(
  repo: Repo,
  branch: string
): Promise<string | undefined> {
  try {
    const readme = getRepoFile(repo, "readme.md", branch);
    return readme;
  } catch {
    return undefined;
  }
}
