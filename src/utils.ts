import { config } from "dotenv";
import { Response } from "node-fetch";
import {  RepoReference, ToRepo, ToSource } from "./types";

export const fetchError = (prelude: string, url: string, res: Response): Error => {
  const e = new Error(`[${res.status}, ${url}]: ${prelude}\n\n${res.statusText}\n`);
  e.name = "ApiError";
  return e;
};

export const getEnv = (): ImportMetaEnv => {
  config();
  return import.meta.env;
};

export const extractRepoAndSource = <TRep extends RepoReference>(r: TRep) => {
  if (r.startsWith("http")) {
    const repo = r.split("/").slice(-2).join("/") as ToRepo<TRep>;
    const source = (
      r.startsWith("https://github.com")
      ? "github"
      : r.startsWith("https://bitbucket")
        ? "bitbucket"
        : r.startsWith("https://gitlab")
          ? "gitlab"
          : undefined
    ); 
    if (!source) {
      throw new Error(`Invalid Git source: ${r}`);
    }

    return { 
      repo,
      source
    } as { repo: ToRepo<TRep>; source: ToSource<TRep> };
  } else {
    return {
      source: "github" as ToSource<TRep>,
      repo: r as ToRepo<TRep>
    };
  }
};