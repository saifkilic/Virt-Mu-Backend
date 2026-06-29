import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAchievement extends Document {
  id: string;
  name: string;
  description: string;
  type: 'saves' | 'comments';
  threshold: number;
  earnedAt: Date;
}

export interface IRefreshToken extends Document {
  token: string;
  expiresAt: Date;
  createdAt?: Date;
}

export interface IUser extends Document {
  email: string;
  username: string;
  password?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  profile: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  language: 'en' | 'ur';
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  preferences: {
    notifications: boolean;
    newsletter: boolean;
  };
  stats: {
    artifactsViewed: number;
    totalTimeSpent: number;
    commentsCount: number;
    favoritesCount: number;
    museumsVisited: Array<{
      museumId: mongoose.Types.ObjectId;
      visitCount: number;
      totalTime: number;
      lastVisit: Date;
    }>;
  };
  favorites: mongoose.Types.ObjectId[];
  achievements: IAchievement[];
  refreshTokens: IRefreshToken[];
  role: 'user' | 'curator' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const achievementSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['saves', 'comments'], required: true },
  threshold: { type: Number, required: true },
  earnedAt: { type: Date, default: Date.now },
});

const refreshTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,     // Keeps uniqueness constraint + index
    sparse: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    // Removed index: true → we'll define it once on the parent schema
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  displayName: String,
  avatar: String,
  bio: String,
  language: {
    type: String,
    enum: ['en', 'ur'],
    default: 'en',
  },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  preferences: {
    notifications: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false },
  },
  stats: {
    artifactsViewed: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    favoritesCount: { type: Number, default: 0 },
    museumsVisited: [
      {
        museumId: { type: Schema.Types.ObjectId, ref: 'Museum' },
        visitCount: { type: Number, default: 0 },
        totalTime: { type: Number, default: 0 },
        lastVisit: Date,
      },
    ],
  },
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: 'Artifact',
  }],
  achievements: [achievementSchema],
  refreshTokens: [refreshTokenSchema],

  role: {
    type: String,
    enum: ['user', 'curator', 'admin'],
    default: 'user',
  },
}, { timestamps: true });

// === Indexes (defined once) ===
userSchema.index({ 'refreshTokens.token': 1 });           // for fast token lookup
userSchema.index({ 'refreshTokens.expiresAt': 1 });       // for expiration cleanup
userSchema.index({ 'refreshTokens.token': 1, 'refreshTokens.expiresAt': 1 }); // compound for validation

userSchema.index({ createdAt: -1 });

// Pre-save hook to hash user passwords
userSchema.pre('save', async function () {
  const user = this as any;
  if (!user.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password || '', salt);
});

// Compare password helper method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    throw new Error('Password field not populated in document');
  }
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);