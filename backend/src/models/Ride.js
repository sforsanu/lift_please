import mongoose from 'mongoose';

const geoPointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number],
      validate: {
        validator(value) {
          return (
            Array.isArray(value) &&
            value.length === 2 &&
            Number.isFinite(value[0]) &&
            Number.isFinite(value[1]) &&
            value[0] >= -180 &&
            value[0] <= 180 &&
            value[1] >= -90 &&
            value[1] <= 90
          );
        },
        message: 'Coordinates must be [longitude, latitude]',
      },
    },
  },
  { _id: false },
);

const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    placeId: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
    coordinates: geoPointSchema,
  },
  { _id: false },
);

const rideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    driverName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    driverAvatar: {
      type: String,
      trim: true,
    },
    driverRating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    leavingFrom: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    goingTo: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    pickupLocation: locationSchema,
    destinationLocation: locationSchema,
    stops: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
    time: {
      type: String,
      required: true,
      match: /^\d{2}:\d{2}$/,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    seatsAvailable: {
      type: Number,
      required: true,
      min: 0,
      max: 12,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    carModel: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    vehicleType: {
      type: String,
      enum: ['car', 'bike', 'ev'],
      default: 'car',
    },
    vehicleModel: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    vehicleNumber: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    vehicleColor: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    vehicle: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    interests: {
      type: [String],
      default: [],
    },
    musicTaste: {
      type: [String],
      default: [],
    },
    carbonSaved: {
      type: Number,
      default: 0,
      min: 0,
    },
    verifiedDriver: {
      type: Boolean,
      default: false,
    },
    recentFeedback: {
      passengerName: { type: String, trim: true },
      passengerAvatar: { type: String, trim: true },
      rating: { type: Number, default: 5 },
      comment: { type: String, trim: true },
      dateAgo: { type: String, trim: true },
    },
    deliveryAvailable: {
      type: Boolean,
      default: false,
    },
    availableLuggageSpace: {
      type: String,
      enum: ['none', 'small', 'medium', 'large'],
      default: 'none',
    },
    routeDistanceKm: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'scheduled', 'started', 'client_picked_up', 'completed', 'cancelled'],
      default: 'ACTIVE',
      index: true,
    },
    pickupPin: {
      type: String,
      trim: true,
    },
    currentLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date,
    },
  },
  { timestamps: true },
);

rideSchema.index({ leavingFrom: 'text', goingTo: 'text' });
rideSchema.index({ date: 1, leavingFrom: 1, goingTo: 1 });
rideSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
rideSchema.index({ 'destinationLocation.coordinates': '2dsphere' });
rideSchema.index({ date: 1, seatsAvailable: 1, status: 1 });

rideSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Ride = mongoose.model('Ride', rideSchema);
