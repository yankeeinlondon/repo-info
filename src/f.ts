import fetch, { Headers } from "node-fetch";
import {  ApiRequestOptions, FetchGlobalOptions } from "./types/general";
import { fetchError } from "src/utils";
import qs from "query-string";

/**
 * **f**
 * 
 * A higher-order wrapper around `node-fetch` which receives default options for requests
 * up front and then provides back a _fetch-like_ API surface.
 */
export const f = (config: FetchGlobalOptions = {}) => async <R extends unknown = unknown, QP extends {} = {}>(
  url: string, 
  content: "json" | "text", 
  errText: string, 
  options?: ApiRequestOptions<QP>,
  additionalHeaders?: Record<string, any>
): Promise<R> => {
  const { username:Username, password:Password, qp:qpDefaults} = config;
  const hasHeaders = Username || Password || additionalHeaders;
  const headers = new Headers(hasHeaders 
    ? {
      ...(Password ? { Authorization: `Token ${Password}` } : {}),
      ...(qpDefaults || options?.qp ? {...qpDefaults, ...(options?.qp)} : {}),
    }
    : {}
  );
  const qp = qs.stringify({...qpDefaults,...(options?.qp)});
  url = qp.length > 0 
    ? `${url}?${qp}`
    : url;
    
  const res = await fetch(url, { headers });

  if (res.ok) {
    const result = content === "json"
      ? await res.json()
      : await res.text();
    
    return result as R;
  } else {
    if (res.status === 403) {
      const hasAuth = Username && Password;
      errText = hasAuth 
      ? `${errText}\nThe rate error occurred despite basic auth being used with a personal access token (ending in ${Password.slice(-4)})`
      : `${errText}\nThere was no access token passed to the provider`;
    }
    throw fetchError(errText, url, res);
  }
};