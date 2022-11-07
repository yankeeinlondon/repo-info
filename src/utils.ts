import { config } from "dotenv";
import { mapTo } from "inferred-types";
import { Response } from "node-fetch";
import {  GitSource, RepoReference, ToRepo, ToSource } from "./types";

export const fetchError = (prelude: string, url: string, res: Response): Error => {
  const e = new Error(`[${res.status}, ${url}]: ${prelude}\n\n${res.statusText}\n`);
  e.name = "ApiError";
  return e;
};

export const getEnv = (): ImportMetaEnv => {
  config();
  return import.meta.env;
};

/**
 * An _identity_ mapper for cases where no mapper is needed
 */
export const identity = <T extends {}>(i: T) => mapTo<T,T>(m => [m])(i);

export const extractRepoAndSource = <TRep extends RepoReference>(r: TRep) => {
  if (r.startsWith("http")) {
    const repo = r.split("/").slice(-2).join("/") as ToRepo<TRep>;
    const source = (
      r.startsWith("https://github.com")
      ? GitSource.github
      : r.startsWith("https://bitbucket")
        ? GitSource.bitbucket
        : r.startsWith("https://gitlab")
          ? GitSource.gitlab
          : GitSource.unknown
    );
    if (!source) {
      throw new Error(`Invalid Git source: ${r}`);
    }

    return { 
      repo,
      source
    } as { repo: ToRepo<TRep>; source: GitSource };
  } else {
    return {
      source: "github" as ToSource<TRep>,
      repo: r as ToRepo<TRep>
    };
  }
};