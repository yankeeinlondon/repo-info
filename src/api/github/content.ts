// transforms content from github into better format

import { Url } from "src/types/general";
import { GithubContent, RepoContent } from "src/types/req-resp";



export const tightenUpContent = (content: readonly GithubContent[]): RepoContent => {
  const result: RepoContent = {
    dir: "",
    files: [],
    subDirectories: [],
    otherAssets: []
  };

  if(Array.isArray(content)) {
    for (const c of content) {
      switch(c.type) {
        case "file": {
          result.files.push({
            kind: "file",
            filename: c.name,
            filepath: c.path.replace(c.name, ""),
            sha: c.sha,
            size: c.size,
            url: c.html_url as Url,
            raw_url: c.download_url as Url,
          });
          break;
        }
        case "dir": {
          result.subDirectories.push(c.name);
          break;
        }
        case "symlink": {
          result.otherAssets.push({
            kind: "symlink",
            sha: c.sha
          });
          break;
        }
        case "submodule": { 
          result.otherAssets.push({
            kind: "submodule",
            sha: c.sha,
            name: c.name
          });
        break;
        }
      }
    }
  }


  return result;
};