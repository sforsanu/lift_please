import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { Ride } from '../models/Ride.js';

const router = Router();

router.get('/', authenticate, async (_req, res, next) => {
  try {
    const [stats] = await Ride.aggregate([
      {
        $group: {
          _id: null,
          totalCo2SavedKg: { $sum: '$carbonSaved' },
          tripsTaken: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalCo2SavedKg: { $round: ['$totalCo2SavedKg', 1] },
          tripsTaken: 1,
          treesEquivalent: { $floor: { $divide: ['$totalCo2SavedKg', 22] } },
          totalKmShared: { $floor: { $multiply: ['$totalCo2SavedKg', 4] } },
        },
      },
    ]);

    res.json(
      stats || {
        totalKmShared: 0,
        totalCo2SavedKg: 0,
        treesEquivalent: 0,
        tripsTaken: 0,
      },
    );
  } catch (error) {
    next(error);
  }
});

export default router;
