import mongoose, { Document, Schema } from 'mongoose';

export interface IMuseum extends Document {
  code: 'lahore' | 'taxila' | 'national_karachi' | 'mohenjo_daro';
  name: {
    en: string;
    ur: string;
  };
  slug: string;
  description?: {
    en?: string;
    ur?: string;
  };
  longDescription?: {
    en?: string;
    ur?: string;
  };
  thumbnail?: string;
  heroImage?: string;
  logo?: string;
  theme?: {
    primaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
  };
  location?: {
    name?: string;
    address?: string;
    city?: string;
    coordinates?: {
      type: string;
      coordinates: number[];
    };
    phone?: string;
    email?: string;
    website?: string;
  };
  visitingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
    holidays?: string[];
  };
  admissionFee?: {
    pakistaniCitizen?: number;
    student?: number;
    foreigner?: number;
    child?: number;
  };
  founded?: number;
  totalArtifacts: number;
  totalRooms: number;
  historicalSignificance?: {
    en?: string;
    ur?: string;
  };
  mainThemes?: Array<{
    en?: string;
    ur?: string;
  }>;
  curator?: string;
  curatorBio?: string;
  stats?: {
    views?: number;
    uniqueVisitors?: number;
    totalTimeSpent?: number;
    artifactsViewed?: number;
    averageRating?: number;
    reviewCount?: number;
  };
  isUnescoSite: boolean;
  heritageStatus?: {
    local?: string;
    national?: boolean;
    international?: boolean;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const museumSchema = new Schema<IMuseum>({
  code: {
    type: String,
    enum: ['lahore', 'taxila', 'national_karachi', 'mohenjo_daro'],
    required: true,
    unique: true,
    index: true,
  },
  name: {
    en: { type: String, required: true, index: true },
    ur: { type: String, required: true },
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  description: {
    en: String,
    ur: String,
  },
  longDescription: {
    en: String,
    ur: String,
  },
  thumbnail: String,
  heroImage: String,
  logo: String,
  theme: {
    primaryColor: String,
    accentColor: String,
    backgroundColor: String,
  },
  location: {
    name: String,
    address: String,
    city: String,
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    phone: String,
    email: String,
    website: String,
  },
  visitingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
    holidays: [String],
  },
  admissionFee: {
    pakistaniCitizen: { type: Number, default: 0 },
    student: { type: Number, default: 0 },
    foreigner: { type: Number, default: 0 },
    child: { type: Number, default: 0 },
  },
  founded: Number,
  totalArtifacts: { type: Number, default: 0 },
  totalRooms: { type: Number, default: 0 },
  historicalSignificance: {
    en: String,
    ur: String,
  },
  mainThemes: [
    {
      en: String,
      ur: String,
    },
  ],
  curator: String,
  curatorBio: String,
  stats: {
    views: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 },
    artifactsViewed: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  isUnescoSite: { type: Boolean, default: false },
  heritageStatus: {
    local: String,
    national: { type: Boolean, default: false },
    international: { type: Boolean, default: false },
  },
  seo: {
    title: String,
    description: String,
    keywords: [String],
  },
  isPublished: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// Remove museumSchema.index({ code: 1 }); because it's already defined inside the property settings above!
museumSchema.index({ 'location.coordinates': '2dsphere' });
museumSchema.index({ isPublished: 1, order: 1 });

export const Museum = mongoose.model<IMuseum>('Museum', museumSchema);
