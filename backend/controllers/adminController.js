import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/index.js';

// Run once on server startup — creates default admin if none exists
export const seedAdmin = async () => {
  try {
    const existing = await Admin.findOne();
    if (existing) return;

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'TrekAdmin@2024';

    const hashed = await bcrypt.hash(password, 10);

    await Admin.create({ username, password: hashed, role: 'superadmin' });
    console.log(`Default admin seeded — username: "${username}"`);
    console.log('Change this password immediately via /api/admin/change-password');
  } catch (err) {
    console.error('Error seeding admin:', err.message);
  }
};

const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, username: admin.username, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/admin/login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(admin);

    // Set the httpOnly cookie the auth middleware expects
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // false on localhost (plain http)
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT expiresIn
    });

    res.json({
      success: true,
      admin: { username: admin.username, role: admin.role },
      // token removed from the body — it now lives only in the httpOnly cookie
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// GET /api/admin/verify (protected)
export const verify = async (req, res) => {
  // req.admin set by auth middleware
  res.json({ success: true, admin: req.admin });
};

// PATCH /api/admin/change-password (protected)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'currentPassword and newPassword required' });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const match = await bcrypt.compare(currentPassword, admin.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out' });
};