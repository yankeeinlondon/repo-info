import type { Response } from "node-fetch";
import type { GitSource, RepoReference, ToRepo, ToSource } from "./types";
import { config } from "dotenv";
import { mapTo } from "inferred-types";

export function fetchError(prelude: string, url: string, res: Response): Error {
  const e = new Error(`[${res.status}, ${url}]: ${prelude}\n\n${res.statusText}\n`);
  e.name = "ApiError";
  return e;
}

export function getEnv(): ImportMetaEnv {
  config();
  return import.meta.env;
}

/**
 * An _identity_ mapper for cases where no mapper is needed
 */
export const identity = <T>() => mapTo.oneToOne().map<T, T>(m => m);

export function extractRepoAndSource<TRep extends RepoReference>(r: TRep) {
  if (r.startsWith("http")) {
    const repo = r.split("/").slice(-2).join("/") as ToRepo<TRep>;
    const source: GitSource = (
      r.startsWith("https://github.com")
        ? "github"
        : r.startsWith("https://bitbucket")
          ? "bitbucket"
          : r.startsWith("https://gitlab")
            ? "gitlab"
            : "unknown"
    );
    if (!source) {
      throw new Error(`Invalid Git source: ${r}`);
    }

    return {
      repo,
      source,
    } as { repo: ToRepo<TRep>; source: GitSource };
  }
  else {
    return {
      source: "github" as ToSource<TRep>,
      repo: r as ToRepo<TRep>,
    };
  }
}
