import type { AnyObject, EmptyObject, FinalizedMapConfig, Mapper, Narrowable } from "inferred-types";
import type { HeadersInit } from "node-fetch";
import type { RepoSortDirectionality } from "./repo";

/**
 * Whether or not the inputs received from an endpoint are
 * expected to be a `list` or a `singular` item of the given
 * type.
 */
export type RespCardinality = "singular" | "list";

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
export interface FetchRequestOptions<QP extends AnyObject = EmptyObject, On404 extends Narrowable = void> {
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
  on404?: On404;
}

export type ValidMapper = string | EmptyObject;

type Plus404Type<T, T404 extends Narrowable> = undefined extends T404
  ? T
  : T404 extends void
    ? T
    : T & T404;

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
  TStructure extends RespCardinality,
  TMapper extends Mapper<ValidMapper, ValidMapper, FinalizedMapConfig<any, any, any>>,
  TQueryParams extends AnyObject = EmptyObject,
  TOn404 extends Narrowable = undefined,
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
  options?: FetchRequestOptions<TQueryParams, TOn404>
) => TStructure extends "list"
  ? Promise<Plus404Type<TMapper["outputType"][], TOn404>>
  : Promise<Plus404Type<TMapper["outputType"], TOn404>>;

/**
 * A higher order function which receives the global configuration
 * and returns the API surface for the **fetch wrapper**.
 *
 * This fetch wrapper is used by all of the _providers_ to call their
 * respective APIs.
 */
export type FetchWrapper = (config: FetchGlobalOptions) => FetchApi;
