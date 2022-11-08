import { RepoInfo } from "src/RepoInfo";
import { it, expect, describe } from "vitest";
import { Expect, Equal } from "@type-challenges/utils";
import { RepoApi } from "src/types";
// import { and, filter, not } from "inferred-types";

describe("preload data when building API", () => {

  it("pre-load commits", async () => {
    const gha = await RepoInfo(`yankeeinlondon/gha`, { loadNow: true, withCommits: true});
    type A = typeof gha;

    expect(gha.commits).instanceOf(Array);
    expect(gha.getMoreCommits).instanceOf(Function);
    expect(Object.keys(gha)).not.contains("getCommits");

    type cases = [
      Expect<Equal<
        A, //
        RepoApi<"yankeeinlondon/gha", "default-branch", "github", "commits">
      >>
    ];
    const cases: cases = [ true ];
  });

  it("pre-load readme", async () => {
    const gha = await RepoInfo(`yankeeinlondon/gha`, { loadNow: true, withReadme: true });
    type A = typeof gha;

    expect(typeof gha.readme).toBe("object");
    expect(Object.keys(gha)).not.contains("getReadme");

    type cases = [
      Expect<Equal<A, RepoApi<"yankeeinlondon/gha", "default-branch", "github", "readme">>>
    ];
    const cases: cases = [ true ];
  });

});