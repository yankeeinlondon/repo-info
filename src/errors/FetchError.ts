import { createError } from "brilliant-errors";

const [FetchError] = createError("FetchError", "repo-info")()()()({ requireHttpStatus: true });

export {
  FetchError,
};
