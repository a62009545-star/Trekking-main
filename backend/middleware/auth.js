import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  // Read from httpOnly cookie first, fallback to Authorization header
  const token =
    req.cookies?.adminToken ||
    req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};