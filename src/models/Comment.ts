import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  userId: mongoose.Types.ObjectId;
  artifactId: mongoose.Types.ObjectId;
  museumCode: 'lahore' | 'taxila' | 'national_karachi' | 'mohenjo_daro';
  rating?: number;
  text: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  artifactId: {
    type: Schema.Types.ObjectId,
    ref: 'Artifact',
    required: true,
    index: true,
  },
  museumCode: {
    type: String,
    enum: ['lahore', 'taxila', 'national_karachi', 'mohenjo_daro'],
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: false,
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  isApproved: {
    type: Boolean,
    default: true,
    index: true,
  },
}, { timestamps: true });

commentSchema.index({ artifactId: 1, createdAt: -1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
