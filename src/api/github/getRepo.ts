
import type { Endpoints } from "@octokit/types";
import { GITHUB_API_BASE } from "src/constants";

export type GithubRepoMeta =
  Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"];

export async function getRepo(repo: Repo): Promise<GithubRepoMeta> {
  const url = `${GITHUB_API_BASE}/repos/${repo}`;
  const { github_token, github_user } = getEnv();

  
  const res = await axios
    .get<GithubRepoMeta>(url, {
      httpAgent: "Tauri Search",
      ...(github_token && github_user
        ? { auth: { username: github_user, password: github_token } }
        : {})
    })
    .catch((err) => {
      if (axios.isAxiosError(err) && err.response) {
        throw new Error(
          `\nProblem calling Github API [repos, ${err.response.status}, ${url}]\n  - message: ${err.response.data?.message}`
        );
      } else {
        throw new Error(
          `\nProblem calling Github API [repos, ${url}]: ${err.message}`
        );
      }
    });

  return res.data;
}
