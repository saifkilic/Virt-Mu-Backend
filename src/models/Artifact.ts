import mongoose, { Document, Schema } from 'mongoose';

export interface IArtifact extends Document {
  roomId: mongoose.Types.ObjectId;
  museumId: mongoose.Types.ObjectId;
  museumCode: 'lahore' | 'taxila' | 'national_karachi' | 'mohenjo_daro';
  name: {
    en: string;
    ur: string;
  };
  slug: string;
  description: {
    en: string;
    ur: string;
  };
  longDescription?: {
    en?: string;
    ur?: string;
  };
  category: 
    | 'painting'
    | 'sculpture'
    | 'relief'
    | 'textile'
    | 'metalwork'
    | 'jewelry'
    | 'manuscript'
    | 'pottery'
    | 'seal'
    | 'coin'
    | 'figurine'
    | 'weapon'
    | 'architectural'
    | 'mummy'
    | 'stone_carving'
    | 'other';
  museumCategory?: string;
  historicalPeriod?: {
    en?: string;
    ur?: string;
  };
  dateRange?: {
    startYear?: number;
    endYear?: number;
    era?: string;
    estimateAccuracy?: 'exact' | 'circa' | 'estimate';
  };
  origin?: {
    region?: string;
    country?: string;
    location?: string;
  };
  materials?: string[];
  technique?: string;
  dimensions?: {
    height?: number;
    width?: number;
    depth?: number;
    diameter?: number;
    unit: string;
  };
  weight?: {
    value?: number;
    unit: string;
  };
  condition?: {
    status: 'excellent' | 'good' | 'fair' | 'poor';
    restoration?: string;
    conservationNotes?: string;
  };
  images: Array<{
    url: string;
    caption?: {
      en?: string;
      ur?: string;
    };
    order: number;
    uploadedAt: Date;
  }>;
  modelUrl?: string;
  imageUrl360?: string;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  scale?: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  hotspot?: {
    radius: number;
    glowIntensity: number;
    glowColor?: string;
  };
  historicalSignificance?: {
    en?: string;
    ur?: string;
  };
  culturalContext?: {
    en?: string;
    ur?: string;
  };
  interestingFacts?: Array<{
    en: string;
    ur: string;
  }>;
  accessionNumber?: string;
  loanStatus?: string;
  owner?: string;
  artist?: string;
  maker?: string;
  attributedTo?: string;
  dynasty?: string;
  relatedArtifacts?: mongoose.Types.ObjectId[];
  relatedLocations?: Array<{
    name: {
      en: string;
      ur: string;
    };
    description?: string;
  }>;
  stats: {
    views: number;
    likes: number;
    shares: number;
    averageRating: number;
    ratingCount: number;
    commentCount: number;
  };
  tags?: string[];
  keywords?: string[];
  seo?: {
    title?: string;
    description?: string;
    imageAlt?: {
      en?: string;
      ur?: string;
    };
  };
  createdBy?: mongoose.Types.ObjectId;
  isHighlighted: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const artifactSchema = new Schema<IArtifact>({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true,
  },
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
    index: true,
  },
  name: {
    en: { type: String, required: true, index: true },
    ur: { type: String, required: true },
  },
  slug: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    en: { type: String, required: true },
    ur: { type: String, required: true },
  },
  longDescription: {
    en: String,
    ur: String,
  },
  category: {
    type: String,
    enum: [
      'painting',
      'sculpture',
      'relief',
      'textile',
      'metalwork',
      'jewelry',
      'manuscript',
      'pottery',
      'seal',
      'coin',
      'figurine',
      'weapon',
      'architectural',
      'mummy',
      'stone_carving',
      'other',
    ],
    required: true,
    index: true,
  },
  museumCategory: String,
  historicalPeriod: {
    en: String,
    ur: String,
  },
  dateRange: {
    startYear: Number,
    endYear: Number,
    era: String,
    estimateAccuracy: {
      type: String,
      enum: ['exact', 'circa', 'estimate'],
    },
  },
  origin: {
    region: String,
    country: String,
    location: String,
  },
  materials: [String],
  technique: String,
  dimensions: {
    height: Number,
    width: Number,
    depth: Number,
    diameter: Number,
    unit: { type: String, default: 'cm' },
  },
  weight: {
    value: Number,
    unit: { type: String, default: 'kg' },
  },
  condition: {
    status: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good',
    },
    restoration: String,
    conservationNotes: String,
  },
  images: [{
    url: { type: String, required: true },
    caption: {
      en: String,
      ur: String,
    },
    order: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  }],
  modelUrl: String,
  imageUrl360: String,
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
  },
  scale: {
    x: { type: Number, default: 1 },
    y: { type: Number, default: 1 },
    z: { type: Number, default: 1 },
  },
  rotation: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
  },
  hotspot: {
    radius: { type: Number, default: 2 },
    glowIntensity: { type: Number, default: 1.2 },
    glowColor: String,
  },
  historicalSignificance: {
    en: String,
    ur: String,
  },
  culturalContext: {
    en: String,
    ur: String,
  },
  interestingFacts: [{
    en: { type: String, required: true },
    ur: { type: String, required: true },
  }],
  accessionNumber: String,
  loanStatus: String,
  owner: String,
  artist: String,
  maker: String,
  attributedTo: String,
  dynasty: String,
  relatedArtifacts: [{
    type: Schema.Types.ObjectId,
    ref: 'Artifact',
  }],
  relatedLocations: [{
    name: {
      en: { type: String, required: true },
      ur: { type: String, required: true },
    },
    description: String,
  }],
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  tags: [String],
  keywords: [String],
  seo: {
    title: String,
    description: String,
    imageAlt: {
      en: String,
      ur: String,
    },
  },
  createdBy: Schema.Types.ObjectId,
  isHighlighted: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

// Compound indexing and search configurations
artifactSchema.index({ museumId: 1, roomId: 1 });
artifactSchema.index({ museumCode: 1, category: 1 });
artifactSchema.index({ 'stats.views': -1 });
artifactSchema.index({ createdAt: -1 });
artifactSchema.index({ museumCode: 1, slug: 1 }, { unique: true });

// Text index for search functionality
artifactSchema.index({
  'name.en': 'text',
  'name.ur': 'text',
  tags: 'text',
  category: 'text',
}, {
  weights: {
    'name.en': 10,
    'name.ur': 10,
    tags: 5,
    category: 2,
  },
  name: 'ArtifactTextIndex',
});

export const Artifact = mongoose.model<IArtifact>('Artifact', artifactSchema);
