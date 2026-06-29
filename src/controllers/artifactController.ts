import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { Artifact } from '../models/Artifact';
import { Room } from '../models/Room';
import { sendResponse as sendSuccess, sendError } from '../utils/response';

export const createArtifact = asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.body;
  
  if (roomId) {
    const roomExists = await Room.findById(roomId);
    if (!roomExists) {
      return sendError(res, 'Room not found', 404);
    }
  }

  if (req.file) {
    req.body.images = [req.file.path];
  }

  const artifact = await Artifact.create(req.body);
  sendSuccess(res, artifact, 'Artifact created', 201);
});

export const getArtifacts = asyncHandler(async (req: Request, res: Response) => {
  const { category, museumCode, tags, description, historicalPeriod } = req.query as any;
  const filter: any = {};
  
  if (category) filter.category = category;
  if (museumCode) filter.museumCode = museumCode;
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : (tags as string).split(',');
    filter.tags = { $in: tagArray };
  }
  if (description) filter.description = { $regex: description as string, $options: 'i' };
  if (historicalPeriod) filter['historicalPeriod.en'] = { $regex: historicalPeriod as string, $options: 'i' };
  
  const total = await Artifact.countDocuments(filter);
  const artifacts = await Artifact.find(filter);
  
  sendSuccess(res, { artifacts, total }, 'Artifacts fetched with filters');
});

export const getArtifact = asyncHandler(async (req: Request, res: Response) => {
  const artifact = await Artifact.findById(req.params.id);
  if (!artifact) return sendError(res, 'Artifact not found', 404);
  sendSuccess(res, artifact, 'Artifact fetched');
});

export const updateArtifact = asyncHandler(async (req: Request, res: Response) => {
  const artifact = await Artifact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!artifact) return sendError(res, 'Artifact not found', 404);
  sendSuccess(res, artifact, 'Artifact updated');
});

export const deleteArtifact = asyncHandler(async (req: Request, res: Response) => {
  const artifact = await Artifact.findByIdAndDelete(req.params.id);
  if (!artifact) return sendError(res, 'Artifact not found', 404);
  sendSuccess(res, null, 'Artifact deleted');
});