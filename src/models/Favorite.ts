// src/models/Favorite.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  artifactId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    artifactId: { type: Schema.Types.ObjectId, ref: 'Artifact', required: true, index: true },
  },
  { timestamps: true }
);

// Ensure a user can favorite an artifact only once
favoriteSchema.index({ userId: 1, artifactId: 1 }, { unique: true });

export const Favorite = mongoose.model<IFavorite>('Favorite', favoriteSchema);
