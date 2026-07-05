import mongoose from 'mongoose';

const daySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },

    duration: {
      days: { type: Number, required: true },
      nights: { type: Number, required: true },
    },

    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Difficult', 'Extreme'],
      required: true,
    },

    price: {
      amount: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },

    location: {
      region: { type: String },
      state: { type: String },
    },

    groupSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 20 },
    },

    highlights: [{ type: String }],
    included: [{ type: String }],
    excluded: [{ type: String }],
    itinerary: [daySchema],
    bestSeason: [{ type: String }],
    tags: [{ type: String }],

    images: [
      {
        url: { type: String, required: true },
        filename: { type: String },
      },
    ],

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Package', packageSchema);