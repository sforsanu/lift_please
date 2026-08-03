import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// In-memory seed storage for package delivery requests
let deliveryRequests = [
  {
    id: 'pkg_101',
    requesterId: 'user_dev_01',
    requesterName: 'Priya Dash',
    requesterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    requesterPhone: '9876543210',
    itemTitle: 'Important Legal Contract Documents',
    category: 'Documents',
    weightClass: 'Under 1 kg',
    pickupAddress: 'Patia Square, Bhubaneswar, Odisha',
    dropAddress: 'Grand Road, Near Jagannath Temple, Puri',
    offeredReward: 200,
    status: 'OPEN',
    notes: 'Urgent document envelope, please handle with care.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pkg_102',
    requesterId: 'user_dev_02',
    requesterName: 'Aman Sharma',
    requesterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    requesterPhone: '9123456789',
    itemTitle: 'Laptop Charger & External Hard Drive',
    category: 'Electronics',
    weightClass: '1 - 5 kg',
    pickupAddress: 'Infocity Tech Hub, Bhubaneswar',
    dropAddress: 'Badambadi, Cuttack',
    offeredReward: 150,
    status: 'OPEN',
    notes: 'Small padded electronic bag.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pkg_103',
    requesterId: 'user_dev_03',
    requesterName: 'Smruti Mohanty',
    requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    requesterPhone: '9988776655',
    itemTitle: 'Home-cooked Sweets & Pitha Box',
    category: 'Food/Grocery',
    weightClass: '1 - 5 kg',
    pickupAddress: 'Saheed Nagar, Bhubaneswar',
    dropAddress: 'Sanabandhakera, Brahmagiri, Puri',
    offeredReward: 250,
    status: 'OPEN',
    notes: 'Fresh sweets box for family.',
    createdAt: new Date().toISOString(),
  },
];

router.get('/', (req, res) => {
  res.json(deliveryRequests);
});

router.post('/', authenticate, (req, res) => {
  const { itemTitle, category, weightClass, pickupAddress, dropAddress, offeredReward, notes } = req.body;
  if (!itemTitle || !pickupAddress || !dropAddress) {
    return res.status(400).json({ message: 'Item title, pickup address, and drop address are required.' });
  }

  const newRequest = {
    id: `pkg_${Date.now()}`,
    requesterId: req.user._id || req.user.id || 'user_current',
    requesterName: req.user.name || 'Lift Member',
    requesterAvatar: req.user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    requesterPhone: req.user.profile?.phone || '9876543210',
    itemTitle,
    category: category || 'Small Parcel',
    weightClass: weightClass || '1 - 5 kg',
    pickupAddress,
    dropAddress,
    offeredReward: Number(offeredReward) || 100,
    status: 'OPEN',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  deliveryRequests.unshift(newRequest);
  res.status(201).json(newRequest);
});

router.post('/:id/accept', authenticate, (req, res) => {
  const { id } = req.params;
  const item = deliveryRequests.find((r) => r.id === id);
  if (!item) {
    return res.status(404).json({ message: 'Package request not found.' });
  }

  item.status = 'ACCEPTED';
  item.assignedTravelerId = req.user._id || req.user.id;
  item.assignedTravelerName = req.user.name || 'Traveler';
  item.assignedTravelerAvatar = req.user.avatarUrl;

  res.json(item);
});

router.post('/:id/complete', authenticate, (req, res) => {
  const { id } = req.params;
  const item = deliveryRequests.find((r) => r.id === id);
  if (!item) {
    return res.status(404).json({ message: 'Package request not found.' });
  }

  item.status = 'DELIVERED';
  res.json(item);
});

export default router;
