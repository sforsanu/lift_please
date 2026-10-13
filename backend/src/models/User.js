import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    resetPasswordCode: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    profile: {
      phone: { type: String, trim: true, unique: true, sparse: true },
      firstName: { type: String, trim: true, maxlength: 80 },
      lastName: { type: String, trim: true, maxlength: 80 },
      mobileVerified: { type: Boolean, default: false },
      emailVerified: { type: Boolean, default: false },
      addressLine: { type: String, trim: true, maxlength: 240 },
      city: { type: String, trim: true, maxlength: 120 },
      state: { type: String, trim: true, maxlength: 120 },
      country: { type: String, trim: true, maxlength: 120 },
      pincode: { type: String, trim: true, maxlength: 24 },
      gender: { type: String, trim: true, maxlength: 40 },
      dateOfBirth: { type: String, trim: true },
      emergencyContact: { type: String, trim: true, maxlength: 40 },
      bio: { type: String, trim: true, maxlength: 500 },
      rating: { type: Number, default: 5, min: 0, max: 5 },
      verifiedDriver: { type: Boolean, default: false },
      vehicleNumber: { type: String, trim: true, maxlength: 40 },
      vehicleModel: { type: String, trim: true, maxlength: 80 },
      vehicleFrontUrl: { type: String, trim: true },
      vehicleRearUrl: { type: String, trim: true },
      ownerSelfieUrl: { type: String, trim: true },
      locationVerified: { type: Boolean, default: false },
      idVerified: { type: Boolean, default: false },
    },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

userSchema.methods.setPassword = async function setPassword(password) {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
  this.passwordHash = await bcrypt.hash(password, saltRounds);
};

userSchema.methods.comparePassword = async function comparePassword(password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
