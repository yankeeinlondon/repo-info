
import { Mapper, EnumValues, FinalizedMapConfig } from "inferred-types";
import { HeadersInit } from "node-fetch";
import { RepoSortDirectionality } from "./repo";

export enum RespStructure {
  /** a singular item of the given type */
  "singular" = "singular",
  /** a _list_ of items of the given type */
  "list" = "list"
}
export type RespStructureValues = EnumValues<RespStructure>;

export interface FetchGlobalOptions {
  /**
   * The auth token provided by the Git host to authorize API requests
   */
  token?: string;
  /**
   * Default values for common _query parameters_ used in getting info from
   * Git repos.
   */
  qp?: { 
    page?: string;
    per_page?: string;
    direction?: RepoSortDirectionality;
  };
}

/**
 * Options available to any given API request
 */
export type FetchRequestOptions<QP extends {} = {}> = {
  /**
   * An API token to include in a particular request.
   * 
   * Note: typically you would set ENV variable and have
   * this passed through automatically for all requests.
   */
  token?: string;
  /**
   * A particular message you want included in error message
   * should there be one. In most cases the default error message
   * should be decently verbose already.
   */
  errText?: string;
  /** the query parameters to include in a GET request */
  qp?: QP;
  headers?: HeadersInit;
  /**
   * Specify whether content should use the fetch methods `.json()` or 
   * `.text()` methods to extract response payload.
   */
  as?: "json" | "text";

  /**
   * If you want to handle 404 errors and return something other than
   * the error you can do so by using this configuration item.
   */
  on404?: undefined | (<T>(t: T) => T);
};

export type ValidMapper = string | {};

/**
 * **FetchApi**
 * 
 * A request for a fetch request via the fetch-wrapper provided in 
 * this repo.
 * 
 * ```ts
 * const mapper = mapTo<GithubCommit, RepoCommit>( ... );
 * return fetch(url, "array", mapper, { qp });
 * ```
 */
export type FetchApi = <
  TStructure extends RespStructureValues,
  TMapper extends Mapper<ValidMapper,ValidMapper,FinalizedMapConfig<any, any, any>>,
  TQueryParams extends {} = {}
>(
  /** the request URL you are calling */
  url: string,
  /** whether the input is a singular item or an list  */
  structure: TStructure,
  /**
   * A mapper function -- generated via the `mapTo` utility in
   * _inferred-types_ -- to map the git hosting services data
   * back to a common understanding of the API surface this 
   * library supports.
   */
  respMapper: TMapper,
  options?: FetchRequestOptions<TQueryParams>
) => TStructure extends "list"
    ? Promise<TMapper["outputType"][]>
    : Promise<TMapper["outputType"]>;

/**
 * A higher order function which receives the global configuration
 * and returns the API surface for the **fetch wrapper**.
 * 
 * This fetch wrapper is used by all of the _providers_ to call their
 * respective APIs.
 */
export type FetchWrapper = (config: FetchGlobalOptions) => FetchApi;

