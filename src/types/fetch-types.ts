import { EnumValues, MapFn, MapTo } from "inferred-types";
import { HeadersInit } from "node-fetch";
import { RepoSortDirectionality } from "./repo";

export enum RespStructure {
  /** an api which returns a string as a response */
  "text" = "text",
  /** an API which returns a single structured object via JSON */
  "obj" = "obj",
  /** an API which returns an array of structured objects via JSON */
  "array" = "array",

  /**
   * an API which receives an array of records but convert this into
   * a single object
   */
  "arrayToObj" = "arrayToObj"
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
export type ApiRequestOptions<QP extends {} = {}> = {
  token?: string;
  errText: string;
  qp?: QP;
  headers?: HeadersInit;
};

export type Target<T extends MapTo<any, any>> = T extends MapTo<any, infer TO>
  ? TO
  : never;

export type From<T extends MapTo<any, any>> = T extends MapTo<infer FROM, any>
  ? FROM
  : never;

export type ValidMapper = string | {};

/**
 * A type utility which converts the structure and mapping of the request
 * into the expected response structure.
 */
export type ApiResponse<
  TStructure extends RespStructureValues, 
  TMap extends MapTo<ValidMapper, ValidMapper>
> = TStructure extends "array"
  ? Target<TMap>[]
  : Target<TMap>;

/**
 * **FetchApi**
 * 
 * A function which is provided the critical information to not only
 * retrieve the foreign content via a git providers API, but also to
 * convert the response in a generalized type.
 * 
 * ```ts
 * const mapper = mapTo<GithubCommit, RepoCommit>( ... );
 * return fetch(url, "array", mapper, { options });
 * ```
 */
export type FetchApi = <
  TStructure extends RespStructureValues,
  TMapper extends MapFn<any, any, any >,
  TQueryParams extends {} = {}
>(
  url: string, 
  structure: TStructure,
  /**
   * A `MapTo<F,T>` mapper function which maps from the API's response
   * to the generic `RepoXXX` type.
   * 
   * In most cases we recommend using the `mapTo` utility in 
   * [inferred-types](https://github.com/inocan-group/inferred-types) to build 
   * this mapper but there is no requirement to.
   */
  respMapper: TMapper,
  options: ApiRequestOptions<TQueryParams>
) => Promise<ApiResponse<TStructure, TMapper>>;

/**
 * A higher order function which receives the global configuration
 * and returns the API surface for the **fetch wrapper**.
 * 
 * This fetch wrapper is used by all of the _providers_ to call their
 * respective APIs.
 */
export type FetchWrapper = (config: FetchGlobalOptions) => FetchApi;

