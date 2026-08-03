import { OAuth2Client } from 'google-auth-library';
import { Router } from 'express';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { clearSessionCookie, setSessionCookie, signToken } from '../utils/auth.js';
import { httpError } from '../utils/httpError.js';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function serializeUser(user) {
  const json = user.toJSON();
  return {
    id: json.id,
    name: json.name,
    email: json.email,
    avatarUrl: json.avatarUrl,
    authProvider: json.authProvider,
    profile: json.profile,
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

function normalizePhone(phone) {
  return String(phone || '').replace(/[^\d+]/g, '').trim();
}

function isValidPhone(phone) {
  return /^\+?\d{10,15}$/.test(phone);
}

async function startSession(res, user) {
  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);
  setSessionCookie(res, token);

  return { token, user: serializeUser(user) };
}

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const phone = normalizePhone(req.body.phone);

    if (!name?.trim()) {
      throw httpError(400, 'Name is required');
    }

    if (!isValidEmail(normalizedEmail)) {
      throw httpError(400, 'A valid email address is required');
    }

    if (!validatePassword(password)) {
      throw httpError(400, 'Password must be at least 8 characters');
    }

    if (!isValidPhone(phone)) {
      throw httpError(400, 'A valid mobile number is required');
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw httpError(409, 'An account already exists for this email');
    }

    const existingPhone = await User.findOne({ 'profile.phone': phone });
    if (existingPhone) {
      throw httpError(409, 'An account already exists for this mobile number');
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      authProvider: 'local',
      profile: {
        phone,
        verifiedDriver: false,
        rating: 5,
      },
    });
    await user.setPassword(password);
    await user.save();

    const session = await startSession(res, user);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
    const password = req.body.password;

    if (!isValidEmail(normalizedEmail) || !password) {
      throw httpError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      throw httpError(401, 'Invalid email or password');
    }

    const session = await startSession(res, user);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
      throw httpError(500, 'Google Sign-In is not configured');
    }

    if (!credential) {
      throw httpError(400, 'Google credential is required');
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      throw httpError(401, 'Invalid Google account');
    }

    const email = payload.email.toLowerCase();
    const update = {
      name: payload.name || email.split('@')[0],
      email,
      googleId: payload.sub,
      avatarUrl: payload.picture,
      authProvider: 'google',
      lastLoginAt: new Date(),
    };

    const user = await User.findOneAndUpdate(
      { email },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    const session = await startSession(res, user);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const {
      name,
      avatarUrl,
      phone,
      addressLine,
      city,
      state,
      pincode,
      vehicleNumber,
      vehicleModel,
      vehicleFrontUrl,
      vehicleRearUrl,
      ownerSelfieUrl,
      bio,
      emergencyContact,
    } = req.body;

    if (name && name.trim()) {
      req.user.name = name.trim();
    }
    if (avatarUrl !== undefined) {
      req.user.avatarUrl = avatarUrl.trim();
    }

    if (!req.user.profile) {
      req.user.profile = {};
    }

    if (phone !== undefined) req.user.profile.phone = phone.trim();
    if (addressLine !== undefined) req.user.profile.addressLine = addressLine.trim();
    if (city !== undefined) req.user.profile.city = city.trim();
    if (state !== undefined) req.user.profile.state = state.trim();
    if (pincode !== undefined) req.user.profile.pincode = pincode.trim();
    if (vehicleNumber !== undefined) req.user.profile.vehicleNumber = vehicleNumber.trim().toUpperCase();
    if (vehicleModel !== undefined) req.user.profile.vehicleModel = vehicleModel.trim();
    if (vehicleFrontUrl !== undefined) req.user.profile.vehicleFrontUrl = vehicleFrontUrl.trim();
    if (vehicleRearUrl !== undefined) req.user.profile.vehicleRearUrl = vehicleRearUrl.trim();
    if (ownerSelfieUrl !== undefined) req.user.profile.ownerSelfieUrl = ownerSelfieUrl.trim();
    if (bio !== undefined) req.user.profile.bio = bio.trim();
    if (emergencyContact !== undefined) req.user.profile.emergencyContact = emergencyContact.trim();

    // Auto update verification badges based on security details supplied
    if (req.user.profile.addressLine && req.user.profile.city) {
      req.user.profile.locationVerified = true;
    } else {
      req.user.profile.locationVerified = false;
    }

    if (req.user.profile.vehicleNumber) {
      req.user.profile.verifiedDriver = true;
    }

    await req.user.save();
    return res.json({ user: serializeUser(req.user) });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

export default router;
