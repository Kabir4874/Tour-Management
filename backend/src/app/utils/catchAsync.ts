import type { RequestHandler } from "express";

type AsyncRequestHandler = (
  ...args: Parameters<RequestHandler>
) => Promise<unknown>;

export const catchAsync =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error: unknown) => {
      next(error);
    });
  };
