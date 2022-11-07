import { createError } from "brilliant-errors";

const [FetchError, isFetchError] =  createError("FetchError", "repo-info")()()()({requireHttpStatus: true});

export {
  FetchError,
  isFetchError
};