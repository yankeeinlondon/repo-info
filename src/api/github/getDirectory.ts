import { GITHUB_API_BASE } from "src/constants";
import { ApiRequestOptions, Repo } from "src/types/general";


export interface DirectoryOptions {
  branch?: string;
}

/**
 * Returns the markdown files and sub-directories from a given repo (and path)
 */
export async function getDirectory(
  repo: Repo,
  path: string,
  branch: string,
  options: ApiRequestOptions
) {
  const url = `${GITHUB_API_BASE}/repos/${repo}/contents/${path}?ref=${branch}`;

  try {
    const res = await axios.get<GithubContentsResp>(url, {
      httpAgent: "Tauri Search",
      ...(github_token && github_user
        ? { auth: { username: github_user, password: github_token } }
        : {})
    });

    if (res.status < 299) {
      return res;
    } else {
      throw new Error(
        `The attempt to call Github's "contents" API failed [${res.status}, ${url}]: ${res.statusText}`
      );
    }
  } catch (err) {
    throw new Error(
      `The attempt to call Github's "contents" API failed [${url}]: ${
        (err as Error).message
      }`
    );
  }
}
