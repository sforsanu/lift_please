import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { Notification } from '../models/Notification.js';
import { httpError } from '../utils/httpError.js';

const router = Router();

// GET /api/notifications - Get all notifications for current authenticated user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('ride')
      .populate('request')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(
      notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        rideId: n.ride?._id?.toString() || n.ride?.toString(),
        ride: n.ride ? (n.ride.toJSON ? n.ride.toJSON() : n.ride) : null,
        requestId: n.request?._id?.toString() || n.request?.toString(),
        readAt: n.readAt ? n.readAt.toISOString() : null,
        isRead: Boolean(n.readAt),
        createdAt: n.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notification) {
      throw httpError(404, 'Notification not found');
    }
    notification.readAt = new Date();
    await notification.save();
    res.json({ success: true, id: notification._id.toString() });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/read-all - Mark all notifications for user as read
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
