import mongoose from 'mongoose';

const deliveryRequestSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
      index: true,
    },
    traveler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itemDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryLocation: {
      type: String,
      required: true,
      trim: true,
    },
    compensationAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1500,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    acceptedAt: Date,
    completedAt: Date,
  },
  { timestamps: true },
);

deliveryRequestSchema.index({ traveler: 1, status: 1 });
deliveryRequestSchema.index({ buyer: 1, status: 1 });

deliveryRequestSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const DeliveryRequest = mongoose.model('DeliveryRequest', deliveryRequestSchema);
