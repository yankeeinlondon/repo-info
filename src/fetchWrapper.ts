/* eslint-disable unicorn/switch-case-braces */
import fetch, { Headers } from "node-fetch";
import {  FetchGlobalOptions, FetchWrapper } from "./types";
import { FetchError } from "src/errors/FetchError";
import qs from "query-string";

/**
 * **fetchWrapper**
 * 
 * A higher-order wrapper around `node-fetch` which receives default options for requests
 * up front and then provides back a _fetch-like_ API surface.
 */
export const fetchWrapper: FetchWrapper = (config = {} as FetchGlobalOptions) => async (
  url, 
  structure,
  respMapper,
  options
) => {
  const { token:Token, qp:qpDefaults} = config;
  const authToken = Token || options?.token;
  const hasHeaders = (authToken || options?.headers) ? true : false;
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
    const result = options?.as === "text"
      ? await res.text()
      : await res.json();
    
    switch(structure) {
      case "list":
        return respMapper(result as typeof respMapper["inputType"][]) as typeof respMapper["outputType"][] as any;
      case "singular":
        return respMapper(result as typeof respMapper["inputType"]) as typeof respMapper["outputType"] as any;
    }

  } else {
    if (options?.on404 && res.status === 404) {
      // Note: the _any_ is ok here as the top-level FetchWrapper will
      // ensure strong typing is preserved.
      return options.on404 as any;
    }

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