/* eslint-disable unicorn/switch-case-braces */
import fetch, { Headers } from "node-fetch";
import { RespStructure, FetchWrapper } from "./types";
import { FetchError } from "src/errors/FetchError";
import qs from "query-string";

/**
 * **fetchWrapper**
 * 
 * A higher-order wrapper around `node-fetch` which receives default options for requests
 * up front and then provides back a _fetch-like_ API surface.
 */
export const fetchWrapper: FetchWrapper = (config = {}) => async (
  url, 
  structure,
  respMapper,
  options
) => {
  const { token:Token, qp:qpDefaults} = config;
  const authToken = Token || options.token;
  const hasHeaders = (authToken || options.headers) ? true : false;
  const headers = new Headers(hasHeaders 
    ? {
      ...(Token ? { Authorization: `Token ${authToken}` } : {}),
      ...options?.headers
    }
    : {}
  );
  /** query parameters */
  const qp = qs.stringify({...qpDefaults,...options?.qp });
  
  url = qp.length > 0 
  ? `${url}?${qp}`
  : url;
  url = url.replace("contents//", "contents/");
    
  const res = await fetch(url, { headers });

  if (res.ok) {
    const result = structure === RespStructure.text
      ? await res.text()
      : await res.json();    
    
    switch(structure) {
      case "array":
      case RespStructure.arrayToObj:
        return respMapper(result);
      case "obj": 
      case "text":
        respMapper(result as any)?.pop();

    }
    return (
      structure === "array"
        ? (result as any).flatMap(respMapper)
        : respMapper(result as any).pop()
    );
  } else {
    const err = new FetchError(
      options?.errText || `\n[${res.status}, ${res.statusText}] Problems making API call to ${url}\nHeader variables passed in were: ${JSON.stringify(Object.keys(headers))}\n\n${res.statusText}`, 
      `fetch/${structure}`,
      {
        httpStatusCode: res.status,
      } 
    );

    throw err;
  }
};