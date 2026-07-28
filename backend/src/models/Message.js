import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      index: true,
    },
    deliveryRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryRequest',
      index: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    readAt: Date,
  },
  { timestamps: true },
);

messageSchema.index({ ride: 1, createdAt: 1 });
messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ deliveryRequest: 1, createdAt: 1 });

messageSchema.pre('validate', function validateMessageScope(next) {
  if (!this.ride && !this.deliveryRequest && !this.conversation) {
    next(new Error('Message must belong to a ride, delivery request, or conversation'));
    return;
  }
  next();
});

messageSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    ret.timestamp = ret.createdAt;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Message = mongoose.model('Message', messageSchema);
