import type { GithubUrl } from "./types/general";

export function isGithubHrl(s: unknown): s is GithubUrl {
  const re = /https:\/\/github.com\/\S+\/\S+/;
  return !!(typeof s === "string" && re.test(s));
}
