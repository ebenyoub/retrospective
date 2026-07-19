import type { Request } from "express";

export interface ValidatedRequestParts {
  body?: Request["body"];
  query?: Request["query"];
  params?: Request["params"];
}
