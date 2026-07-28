import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['RIDE_REQUEST', 'RIDE_ACCEPTED', 'RIDE_REJECTED', 'NEW_MESSAGE', 'RIDE_CANCELLED', 'RIDE_COMPLETED', 'PROFILE'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'RideRequest' },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    readAt: Date,
  },
  { timestamps: true },
);

notificationSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Notification = mongoose.model('Notification', notificationSchema);
