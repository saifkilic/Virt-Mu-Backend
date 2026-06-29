import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { Room } from '../models/Room';
import { Museum } from '../models/Museum';
import { sendResponse as sendSuccess, sendError } from '../utils/response';

export const createRoom = asyncHandler(async (req: Request, res: Response) => {
  const { museumId } = req.body;
  
  if (museumId) {
    const museumExists = await Museum.findById(museumId);
    if (!museumExists) {
      return sendError(res, 'Museum not found', 404);
    }
  }

  const room = await Room.create(req.body);
  sendSuccess(res, room, 'Room created', 201);
});

export const getRooms = asyncHandler(async (req: Request, res: Response) => {
  const rooms = await Room.find();
  sendSuccess(res, rooms, 'Rooms fetched');
});

export const getRoom = asyncHandler(async (req: Request, res: Response) => {
  const room = await Room.findById(req.params.id);
  if (!room) return sendError(res, 'Room not found', 404);
  sendSuccess(res, room, 'Room fetched');
});

export const updateRoom = asyncHandler(async (req: Request, res: Response) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!room) return sendError(res, 'Room not found', 404);
  sendSuccess(res, room, 'Room updated');
});

export const deleteRoom = asyncHandler(async (req: Request, res: Response) => {
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) return sendError(res, 'Room not found', 404);
  sendSuccess(res, null, 'Room deleted');
});