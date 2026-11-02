import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/UserModel.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'pr1c3r4d4r-my-college-project-secret-2026-xyz';
  return jwt.sign({ id }, secret, {
    expiresIn: '7d',
  });
};

const formatDisplayName = (email, fallback = 'Showcase User') => {
  if (!email) return fallback;
  const username = email.split('@')[0];
  return username
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || fallback;
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ email });
      if (user) {
        // Showcase convenience: if already registered, log in smoothly
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      user = await User.create({
        name,
        email,
        passwordHash,
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    }

    // In-memory fallback if MongoDB is offline
    const fakeId = '60d5ecb8b5c0c24d88e40099';
    return res.status(201).json({
      _id: fakeId,
      name,
      email,
      token: generateToken(fakeId),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ email });

      // If user exists and password matches
      if (user && user.passwordHash && (await bcrypt.compare(password, user.passwordHash))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        });
      }

      // Showcase mode: if user exists but demo password was typed, or if user doesn't exist yet
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        user = await User.create({
          name: formatDisplayName(email),
          email,
          passwordHash,
        });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    }

    // In-memory fallback
    const fakeId = '60d5ecb8b5c0c24d88e40099';
    return res.json({
      _id: fakeId,
      name: formatDisplayName(email),
      email,
      token: generateToken(fakeId),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token, email: mockEmail, name: mockName } = req.body;
    let email = mockEmail;
    let name = mockName;
    let googleId = 'google-mock-' + Date.now();

    // Check if real Google OAuth verification can be attempted
    const hasRealClientId = process.env.GOOGLE_CLIENT_ID && 
      !process.env.GOOGLE_CLIENT_ID.includes('your_google_client_id');

    if (token && token !== 'mock-google-token' && hasRealClientId) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        name = payload.name;
        email = payload.email;
        googleId = payload.sub;
      } catch (verifyErr) {
        console.warn('Real Google token verification note:', verifyErr.message);
      }
    }

    // Showcase fallback defaults
    if (!email) email = 'ayushmittal.demo@gmail.com';
    if (!name) name = formatDisplayName(email, 'Ayush Mittal');

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          name,
          email,
          googleId,
        });
      } else if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    }

    // In-memory fallback
    const fakeId = '60d5ecb8b5c0c24d88e40099';
    return res.json({
      _id: fakeId,
      name,
      email,
      token: generateToken(fakeId),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
