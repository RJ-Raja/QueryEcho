import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// 1. Register a New User
export const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Create and save the new user to MongoDB
    const user = new User({ username, password, role });
    await user.save();
    
    res.status(201).json({ status: 'success', message: "User registered successfully!" });
  } catch (error) {
    console.error("MongoDB Registration Error:", error);
    res.status(400).json({ status: 'error', message: "Registration failed. Username might already exist." });
  }
};

// 2. Login and Generate JWT Token
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Step A: Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ status: 'error', message: "Invalid username or password" });
    }

    // Step B: Check if the password matches (using the method we built in User.js)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: "Invalid username or password" });
    }

    // Step C: Create the secure JWT Token (The "ID Card")
    // We embed their userId and their role directly into this token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token automatically expires in 1 day for security
    );

    // Send the token and role back to the React frontend
    res.status(200).json({
      status: 'success',
      message: "Login successful",
      token: token,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: "Server error during login" });
  }
};
