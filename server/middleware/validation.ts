import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateRequestBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error: any) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors || error.message
      });
    }
  };
};

export const validateRequestParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams;
      next();
    } catch (error: any) {
      return res.status(400).json({
        error: "Invalid parameters",
        details: error.errors || error.message
      });
    }
  };
};

export const validateRequestQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery;
      next();
    } catch (error: any) {
      return res.status(400).json({
        error: "Invalid query parameters",
        details: error.errors || error.message
      });
    }
  };
};