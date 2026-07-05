import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import { sendBookingStatusEmail } from '../utils/email.js';

// Helper: generate next sequential bookingId like TRK00001
const generateBookingId = async () => {
  const last = await Booking.findOne().sort('-createdAt');

  let nextNumber = 1;
  if (last && last.bookingId) {
    const match = last.bookingId.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `TRK${String(nextNumber).padStart(5, '0')}`;
};

// Valid status transitions
const VALID_TRANSITIONS = {
  Pending: ['Approved', 'Cancelled'],
  Approved: ['Cancelled', 'Completed'],
  Cancelled: [],
  Completed: [],
};

// ---------- PUBLIC ----------

// POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const {
      packageId,
      contactPerson,
      travelers,
      groupSize,
      trekDate,
      specialRequests,
      emergencyContact,
    } = req.body;

    if (!packageId || !contactPerson || !trekDate || !groupSize) {
      return res.status(400).json({
        success: false,
        message: 'packageId, contactPerson, groupSize, and trekDate are required',
      });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const bookingId = await generateBookingId();

    const booking = await Booking.create({
      bookingId,
      package: packageId,
      contactPerson,
      travelers,
      groupSize,
      trekDate,
      specialRequests,
      emergencyContact,
    });

    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully',
      data: { bookingId: booking.bookingId, status: booking.status },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/status/:bookingId
export const getBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId }).populate(
      'package',
      'title slug'
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      data: {
        bookingId: booking.bookingId,
        status: booking.status,
        package: booking.package,
        trekDate: booking.trekDate,
        adminNotes: booking.adminNotes,
        cancelReason: booking.cancelReason,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- ADMIN ----------

// GET /api/bookings
export const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('package', 'title slug price')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const [total, pending, approved, cancelled, completed] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'Pending' }),
      Booking.countDocuments({ status: 'Approved' }),
      Booking.countDocuments({ status: 'Cancelled' }),
      Booking.countDocuments({ status: 'Completed' }),
    ]);

    const totalPackages = await Package.countDocuments();
    const activePackages = await Package.countDocuments({ isActive: true });

    const recentBookings = await Booking.find()
      .populate('package', 'title slug')
      .sort('-createdAt')
      .limit(5);

    res.json({
      success: true,
      data: {
        bookings: { total, pending, approved, cancelled, completed },
        packages: { total: totalPackages, active: activePackages },
        recentBookings,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('package');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/bookings/:id/status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, adminNotes, cancelReason } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    // Populate package here so the confirmation/cancellation email can include
    // the trek title and price without a second query.
    const booking = await Booking.findById(req.params.id).populate('package', 'title price');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const allowedNext = VALID_TRANSITIONS[booking.status] || [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${booking.status} to ${status}`,
      });
    }

    if (status === 'Cancelled' && !cancelReason) {
      return res.status(400).json({
        success: false,
        message: 'cancelReason is required when cancelling a booking',
      });
    }

    booking.status = status;
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;
    if (status === 'Cancelled') booking.cancelReason = cancelReason;

    await booking.save();

    // Fire-and-forget: email failures are logged internally and never affect this response.
    sendBookingStatusEmail(booking);

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};