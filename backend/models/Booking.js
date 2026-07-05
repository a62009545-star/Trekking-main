import mongoose from 'mongoose';

const travelerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true }, // e.g. TRK00001
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },

    contactPerson: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String },
    },

    travelers: [travelerSchema],
    groupSize: { type: Number, required: true },
    trekDate: { type: Date, required: true },
    specialRequests: { type: String },

    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },

    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Cancelled', 'Completed'],
      default: 'Pending',
    },

    adminNotes: { type: String },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);