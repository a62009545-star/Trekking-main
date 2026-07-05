import mongoose from 'mongoose';

// ----- Contact -----
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ----- Gallery -----
const gallerySchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    title: { type: String },
    category: {
      type: String,
      enum: ['Trek', 'Camp', 'Nature', 'People', 'Wildlife', 'Other'],
      default: 'Other',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ----- FAQ -----
const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ----- Admin -----
const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    role: { type: String, default: 'superadmin' },
  },
  { timestamps: true }
);

export const Contact = mongoose.model('Contact', contactSchema);
export const Gallery = mongoose.model('Gallery', gallerySchema);
export const FAQ = mongoose.model('FAQ', faqSchema);
export const Admin = mongoose.model('Admin', adminSchema);