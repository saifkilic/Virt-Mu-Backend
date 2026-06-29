import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { sendError } from '../utils/response';

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return sendError(res, errorMessage, 400);
    }
    req.body = value;
    next();
  };
};