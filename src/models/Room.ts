import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  museumId: mongoose.Types.ObjectId;
  museumCode: 'lahore' | 'taxila' | 'national_karachi' | 'mohenjo_daro';
  name: {
    en: string;
    ur: string;
  };
  slug: string;
  description?: {
    en?: string;
    ur?: string;
  };
  historicalContext?: {
    en?: string;
    ur?: string;
  };
  type: 'gallery' | 'wing' | 'section' | 'chamber' | 'hall' | 'exhibition_space' | 'storage';
  sceneData?: {
    modelUrl?: string;
    modelSize?: { x: number; y: number; z: number };
    lighting?: {
      ambientColor?: string;
      ambientIntensity?: number;
      directionalColor?: string;
      directionalIntensity?: number;
      directionalPosition?: { x: number; y: number; z: number };
    };
    skybox?: string;
    camera?: {
      initialPosition?: { x: number; y: number; z: number };
      lookAt?: { x: number; y: number; z: number };
      fov?: number;
    };
  };
  theme?: {
    floorColor?: string;
    wallColor?: string;
    textureSet?: string;
  };
  connections?: Array<{
    roomId: mongoose.Types.ObjectId;
    direction: string;
    doorName?: {
      en?: string;
      ur?: string;
    };
    doorPosition?: { x: number; y: number; z: number };
  }>;
  artifactCount: number;
  estimatedViewTime?: number;
  order: number;
  isMainRoom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>({
  museumId: {
    type: Schema.Types.ObjectId,
    ref: 'Museum',
    required: true,
    index: true,
  },
  museumCode: {
    type: String,
    enum: ['lahore', 'taxila', 'national_karachi', 'mohenjo_daro'],
    required: true,
  },
  name: {
    en: { type: String, required: true },
    ur: { type: String, required: true },
  },
  slug: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    en: String,
    ur: String,
  },
  historicalContext: {
    en: String,
    ur: String,
  },
  type: {
    type: String,
    enum: [
      'gallery',
      'wing',
      'section',
      'chamber',
      'hall',
      'exhibition_space',
      'storage',
    ],
    required: true,
  },
  sceneData: {
    modelUrl: String,
    modelSize: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
    lighting: {
      ambientColor: { type: String, default: '#FFE5D9' },
      ambientIntensity: { type: Number, default: 0.6 },
      directionalColor: { type: String, default: '#FFFFFF' },
      directionalIntensity: { type: Number, default: 0.8 },
      directionalPosition: {
        x: { type: Number, default: 10 },
        y: { type: Number, default: 20 },
        z: { type: Number, default: 10 },
      },
    },
    skybox: String,
    camera: {
      initialPosition: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 1.6 },
        z: { type: Number, default: 5 },
      },
      lookAt: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 1.6 },
        z: { type: Number, default: 0 },
      },
      fov: { type: Number, default: 60 },
    },
  },
  theme: {
    floorColor: String,
    wallColor: String,
    textureSet: String,
  },
  connections: [{
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    direction: String,
    doorName: {
      en: String,
      ur: String,
    },
    doorPosition: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
  }],
  artifactCount: { type: Number, default: 0 },
  estimatedViewTime: Number,
  order: { type: Number, default: 0 },
  isMainRoom: { type: Boolean, default: false },
}, { timestamps: true });

roomSchema.index({ museumId: 1, order: 1 });
roomSchema.index({ museumCode: 1 });

export const Room = mongoose.model<IRoom>('Room', roomSchema);
