import type { Equal, Expect } from "@type-challenges/utils";
import type { RepoApi } from "src/types";
import { RepoInfo } from "src/RepoInfo";
import { describe, expect, it } from "vitest";

describe("preload data when building API", () => {
  it("pre-load commits", async () => {
    const gha = await RepoInfo(`yankeeinlondon/gha`, { loadNow: true, withCommits: true });
    type A = typeof gha;

    expect(gha.commits).instanceOf(Array);
    expect(gha.getMoreCommits).instanceOf(Function);
    expect(Object.keys(gha)).not.contains("getCommits");

    // @ts-ignore
    type _cases = [
      Expect<Equal<
        A, //
        RepoApi<"yankeeinlondon/gha", "default-branch", "github", "commits">
      >>,
    ];
  });

  it("pre-load readme", async () => {
    const gha = await RepoInfo(`yankeeinlondon/gha`, { loadNow: true, withReadme: true });
    type A = typeof gha;

    expect(typeof gha.readme).toBe("object");
    expect(Object.keys(gha)).not.contains("getReadme");

    // @ts-ignore
    type _cases = [
      Expect<Equal<A, RepoApi<"yankeeinlondon/gha", "default-branch", "github", "readme">>>,
    ];
  });
});
