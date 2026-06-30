import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Access Denied: No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using your secret key
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // This attaches the user's ID and Role (e.g., 'Read-Only') to the request
    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
  }
};