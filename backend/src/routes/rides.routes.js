import { Router } from 'express';
import { db } from '../data/mockDb.js';

const router = Router();

router.get('/', (req, res, next) => {
  try {
    const { leavingFrom, goingTo, date } = req.query;
    const filters = {
      ...(typeof leavingFrom === 'string' && leavingFrom ? { leavingFrom } : {}),
      ...(typeof goingTo === 'string' && goingTo ? { goingTo } : {}),
      ...(typeof date === 'string' && date ? { date } : {}),
    };

    res.json(db.getRides(filters));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const ride = db.getRideById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    return res.json(ride);
  } catch (error) {
    return next(error);
  }
});

router.post('/', (req, res, next) => {
  try {
    const {
      driverName,
      leavingFrom,
      goingTo,
      date,
      time,
      price,
      seatsAvailable,
      totalSeats,
      carModel,
      interests,
      musicTaste,
    } = req.body;

    if (!driverName || !leavingFrom || !goingTo || !date || !time) {
      return res.status(400).json({ message: 'driverName, leavingFrom, goingTo, date, and time are required' });
    }

    const newRide = db.createRide({
      driverName,
      leavingFrom,
      goingTo,
      date,
      time,
      price: Number(price) || 0,
      seatsAvailable: Number(seatsAvailable) || 3,
      totalSeats: Number(totalSeats) || 4,
      carModel: carModel || 'Tesla Model Y (EV)',
      interests: Array.isArray(interests) ? interests : ['Commuting'],
      musicTaste: Array.isArray(musicTaste) ? musicTaste : ['Pop'],
    });

    return res.status(201).json(newRide);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/messages', (req, res, next) => {
  try {
    res.json(db.getMessages(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.post('/:id/messages', (req, res, next) => {
  try {
    const { sender, text } = req.body;
    const rideId = req.params.id;

    if (!sender || !text) {
      return res.status(400).json({ message: 'sender and text are required' });
    }

    const ride = db.getRideById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const userMessage = db.createMessage(rideId, sender, text);
    const driverResponses = [
      'Awesome! Looking forward to having you on board. See you on the road!',
      "Great, that pick-up spot works perfectly for me. I'll arrive around 5 minutes early!",
      'Perfect. Bring your favorite playlist if you want to share music with the group.',
      "Sounds good! I'll ping you here when I'm on my way.",
      'Cool! Let me know if you have any questions or need extra space in the trunk.',
    ];

    setTimeout(() => {
      const responseText = driverResponses[Math.floor(Math.random() * driverResponses.length)];
      db.createMessage(rideId, 'driver', responseText);
    }, 1200);

    return res.status(201).json(userMessage);
  } catch (error) {
    return next(error);
  }
});

export default router;
