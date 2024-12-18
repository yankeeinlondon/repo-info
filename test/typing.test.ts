import type { Equal, Expect } from "@type-challenges/utils";
import type { UnionToTuple } from "inferred-types";
import type { ApiWith, RepoApi, RepoConfig } from "src/types";
import { RepoInfo } from "src/RepoInfo";
import { extractRepoAndSource } from "src/utils";
import { describe, expect, it } from "vitest";

describe("aPI types", () => {
  it("apiWith utility", () => {
    type A1 = ApiWith<true, false>;
    type A2 = ApiWith<false, true>; // "commits"
    type A3 = ApiWith<true, true>; // "readme" | "commits"
    type A4 = ApiWith<false, false>; // "none"

    type T1 = UnionToTuple<A1>;
    type T2 = UnionToTuple<A2>;
    type T3 = UnionToTuple<A3>;
    type T4 = UnionToTuple<A4>;

    // @ts-ignore
    type _cases = [
      Expect<Equal<A1, "readme">>,
      Expect<Equal<A2, "commits">>,
      Expect<Equal<A3, "readme" | "commits">>,
      Expect<Equal<A4, "none">>,
      // tuples
      Expect<Equal<T1, ["readme"]>>,
      Expect<Equal<T2, ["commits"]>>,
      Expect<Equal<T3, ["readme", "commits"]>>,
      Expect<Equal<T4, ["none"]>>,
    ];
  });

  it("extractRepoAndSource() util works in type-strong manner", () => {
    const { repo, source } = extractRepoAndSource("https://github.com/org/repo");
    expect(repo).toBe("org/repo");
    expect(source).toBe("github");

    const { repo: r2, source: s2 } = extractRepoAndSource("https://bitbucket.org/org/repo");
    expect(r2).toBe("org/repo");
    expect(s2).toBe("bitbucket");

    const { repo: r3, source: s3 } = extractRepoAndSource("https://gitlab.com/org/repo");
    expect(r3).toBe("org/repo");
    expect(s3).toBe("gitlab");
  });

  it("the shape of a partially applied API is correct", async () => {
    const api = RepoInfo("org/repo", { loadNow: false });
    type A1 = typeof api;
    expect(api.source).toBe("github");
    expect(api.branch).toBe("default-branch");
    expect(api.repo).toBe("org/repo");
    expect(api.cached).toEqual(["none"]);
    expect(typeof api.load).toBe("function");

    const api2 = RepoInfo("https://github.com/org/repo");
    type A2 = typeof api2;
    expect(api2.source).toBe("github");
    expect(api2.branch).toBe("default-branch");
    expect(api2.repo).toBe("org/repo");
    expect(api2.cached).toEqual(["none"]);

    const api3 = RepoInfo("https://bitbucket.com/org/repo");
    type A3 = typeof api3;
    expect(api3.source).toBe("bitbucket");
    expect(api3.branch).toBe("default-branch");
    expect(api3.repo).toBe("org/repo");
    expect(api3.cached).toEqual(["none"]);

    // @ts-ignore
    type _cases = [
      Expect<Equal<A1, RepoConfig<"org/repo", "default-branch", "github", "none">>>,
      Expect<Equal<A2, RepoConfig<"org/repo", "default-branch", "github", "none">>>,
      Expect<Equal<A3, RepoConfig<"org/repo", "default-branch", "bitbucket", "none">>>,
    ];
  });

  it("loading a partially applied API results in correct type", async () => {
    const lazy = RepoInfo("yankeeinlondon/gha");

    const repo = await lazy.load();
    type R = typeof repo;

    expect(typeof repo.meta).toBe("object");
    expect(repo.meta.name).toBe("gha");
    expect(Array.isArray(repo.listOfBranches)).toBeTruthy();

    // @ts-ignore
    type _cases = [
      Expect<Equal<R, RepoApi<"yankeeinlondon/gha", "default-branch", "github", "none">>>, //
    ];
  });

  it("loadNow returns immediately with a RepoApi", async () => {
    const api = await RepoInfo("yankeeinlondon/gha", { loadNow: true });
    type A = typeof api;

    expect(api.repo).toBe("yankeeinlondon/gha");
    expect(typeof api.getCommits).toBe("function");

    // @ts-ignore
    type _cases = [
      Expect<Equal<A, RepoApi<"yankeeinlondon/gha", "default-branch", "github", "none">>>, //
    ];
  });
});
