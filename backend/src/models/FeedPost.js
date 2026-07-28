import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    publicId: { type: String, trim: true },
    altText: { type: String, trim: true },
  },
  { _id: false },
);

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

const feedPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    media: {
      type: [mediaSchema],
      default: [],
    },
    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    visibility: {
      type: String,
      enum: ['public', 'followers'],
      default: 'public',
      index: true,
    },
  },
  { timestamps: true },
);

feedPostSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const FeedPost = mongoose.model('FeedPost', feedPostSchema);
