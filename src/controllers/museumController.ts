import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { Museum } from '../models/Museum';
import { sendResponse as sendSuccess, sendError } from '../utils/response';

// @desc Create a museum
// @route POST /api/museums
export const createMuseum = asyncHandler(async (req: Request, res: Response) => {
  const museum = await Museum.create(req.body);
  sendSuccess(res, museum, 'Museum created');
});

// @desc Get all museums
// @route GET /api/museums
export const getMuseums = asyncHandler(async (req: Request, res: Response) => {
  const museums = await Museum.find();
  sendSuccess(res, museums, 'Museums retrieved');
});

// @desc Get single museum by id
// @route GET /api/museums/:id
export const getMuseum = asyncHandler(async (req: Request, res: Response) => {
  const museum = await Museum.findById(req.params.id);
  if (!museum) return sendError(res, 'Museum not found', 404);
  sendSuccess(res, museum, 'Museum retrieved');
});

// @desc Update museum
// @route PUT /api/museums/:id
export const updateMuseum = asyncHandler(async (req: Request, res: Response) => {
  const museum = await Museum.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!museum) return sendError(res, 'Museum not found', 404);
  sendSuccess(res, museum, 'Museum updated');
});

// @desc Delete museum
// @route DELETE /api/museums/:id
export const deleteMuseum = asyncHandler(async (req: Request, res: Response) => {
  const museum = await Museum.findByIdAndDelete(req.params.id);
  if (!museum) return sendError(res, 'Museum not found', 404);
  sendSuccess(res, null, 'Museum deleted');
});
