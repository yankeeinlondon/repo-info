import { RepoInfo } from "src/RepoInfo";
import { it, expect, describe } from "vitest";
import { and, filter, not } from "inferred-types";

describe("basics", () => {
  it("instantiating repo gathers meta and branches", async () => {
    const gha = await RepoInfo(`yankeeinlondon/gha`);
    
    expect(gha.branch).toBe("main");
    expect(gha.branchInfo.main).toBeTruthy();
    expect(gha.meta.name).toBe("gha");
  })

  it("getting commits returns appropriate commit structure", async () => {
    const gha = await RepoInfo(`yankeeinlondon/gha`);
    const commits = await gha.getCommits();
    
    expect(Array.isArray(commits)).toBeTruthy();
    expect(typeof commits[0].sha).toBe("string")
  })

  it("getting README returns text when present", async () => {
    const gha = await RepoInfo(`yankeeinlondon/gha`);
    const readme = await gha.getReadme();

    expect(readme).toBeTruthy();
    expect(readme.content).includes("actions");
  })

  it("get a directory in repo", async () => {
    const gha = await RepoInfo(`yankeeinlondon/gha`);
    const dir = await gha.getContentInRepo("");

    expect(Array.isArray(dir.subDirectories)).toBeTruthy();
    expect(typeof dir.subDirectories[0]).toBe("string");
    expect(Array.isArray(dir.files)).toBeTruthy();
    expect(typeof dir.files[0]).toBe("object");
  })

  it("build a sitemap ", async() => {
    const tauri = await RepoInfo(`yankeeinlondon/gha`);
    const yaml = and(
      filter({ endsWith: [".yaml", ".yml"]} ),
      not(filter({ startsWith: [".", "_"]}))
    );
    
    const sm = await tauri.buildSitemap("", {
      fileFilter: yaml,
    });

    expect(sm.repo).toBe("yankeeinlondon/gha");
    expect(sm.root.dir).toBe("");
    const dirs = sm.root.subDirectories.map(i => i.dir);
    expect(dirs).toContain("/.github");
    expect(dirs).toContain("/.vscode");

    expect(typeof sm.flatten).toBe("function");
    const flat = sm.flatten();
    const files = flat.files.map(f => f.filename);
    
    expect(files).toContain("js-ci-main.yml");
  })
});
