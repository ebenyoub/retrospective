import { NextFunction, Response, Request } from "express";

// Express 4 (version utilisée par ce projet) ne transmet pas automatiquement
// les rejets de promesse d'un handler async au middleware d'erreur, contrairement
// à Express 5. Ce wrapper fait ce travail explicitement via next(error).
export const asyncHandler = <Req extends Request = Request>(
  handler: (req: Req, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Req, res: Response, next: NextFunction) => {
    return handler(req, res, next).catch(next);
  };
};
