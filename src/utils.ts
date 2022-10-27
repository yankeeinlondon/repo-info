import { config } from "dotenv";
import { Response } from "node-fetch";

export const fetchError = (prelude: string, url: string, res: Response): Error => {
  const e = new Error(`[${res.status}, ${url}]: ${prelude}\n\n${res.statusText}\n`);
  e.name = "ApiError";
  return e;
};

export const getEnv = (): ImportMetaEnv => {
  config();
  return import.meta.env;
};