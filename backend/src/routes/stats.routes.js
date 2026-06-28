import { Router } from 'express';
import { db } from '../data/mockDb.js';

const router = Router();

router.get('/', (_req, res, next) => {
  try {
    res.json(db.getStats());
  } catch (error) {
    next(error);
  }
});

export default router;
