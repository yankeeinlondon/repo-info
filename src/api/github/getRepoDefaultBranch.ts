import { Repo } from "~/index";
import { getRepo } from "./getRepo";

export async function getRepoDefaultBranch(repo: Repo) {
  const r = await getRepo(repo);
  return r.default_branch;
}
