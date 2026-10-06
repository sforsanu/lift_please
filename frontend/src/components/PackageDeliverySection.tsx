import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  Flag,
  Plus,
  Send,
  Check,
  ShieldCheck,
  Sparkles,
  Truck,
  Search,
  Loader2,
  MessageSquare,
  Clock,
  ArrowRight,
  User,
  Filter,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';
import type { LocationSelection, PackageDeliveryRequest, Ride, AuthUser } from '../types';
import GooglePlacesInput from './GooglePlacesInput';

interface PackageDeliverySectionProps {
  rides: Ride[];
  currentUser: AuthUser;
  onOpenChat: (ride: Ride) => void;
}

export default function PackageDeliverySection({ rides, currentUser, onOpenChat }: PackageDeliverySectionProps) {
  const [deliveries, setDeliveries] = useState<PackageDeliveryRequest[]>([]);
  const [pickupFilter, setPickupFilter] = useState<LocationSelection | null>(null);
  const [dropFilter, setDropFilter] = useState<LocationSelection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'HISTORY'>('ALL');

  // Form State for posting package request
  const [itemTitle, setItemTitle] = useState('');
  const [category, setCategory] = useState<'Documents' | 'Electronics' | 'Small Parcel' | 'Heavy Item' | 'Food/Grocery'>('Documents');
  const [weightClass, setWeightClass] = useState<'Under 1 kg' | '1 - 5 kg' | '5 - 15 kg' | '15+ kg'>('1 - 5 kg');
  const [pickupAddress, setPickupAddress] = useState<LocationSelection | null>(null);
  const [dropAddress, setDropAddress] = useState<LocationSelection | null>(null);
  const [offeredReward, setOfferedReward] = useState('200');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDeliveries = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/deliveries', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data);
      }
    } catch (err) {
      console.error('Error fetching delivery requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim() || !pickupAddress || !dropAddress) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          itemTitle,
          category,
          weightClass,
          pickupAddress: pickupAddress.address,
          dropAddress: dropAddress.address,
          offeredReward: Number(offeredReward),
          notes,
        }),
      });

      if (res.ok) {
        const newReq = await res.json();
        setDeliveries([newReq, ...deliveries]);
        setSuccessMsg('Package delivery request published successfully!');
        setTimeout(() => {
          setIsPostModalOpen(false);
          setSuccessMsg('');
          setItemTitle('');
          setNotes('');
        }, 1500);
      }
    } catch (err) {
      console.error('Error creating package request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptDelivery = async (delivery: PackageDeliveryRequest) => {
    try {
      const res = await fetch(`/api/deliveries/${delivery.id}/accept`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const updated = await res.json();
        setDeliveries(deliveries.map((d) => (d.id === delivery.id ? updated : d)));

        const matchRide: Ride = rides[0] || {
          id: `ride_delivery_${delivery.id}`,
          driverName: delivery.requesterName,
          driverAvatar: delivery.requesterAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          driverRating: 4.9,
          leavingFrom: delivery.pickupAddress,
          goingTo: delivery.dropAddress,
          date: 'Today',
          time: 'Flexible',
          price: delivery.offeredReward,
          seatsAvailable: 1,
          totalSeats: 1,
          carModel: 'Parcel Carry',
          interests: ['Package Handover'],
          musicTaste: [],
          carbonSaved: 1.5,
          verifiedDriver: true,
        };
        onOpenChat(matchRide);
      }
    } catch (err) {
      console.error('Error accepting package carry:', err);
    }
  };

  const filteredDeliveries = deliveries.filter((item) => {
    if (activeTab === 'ACTIVE' && item.status !== 'IN_TRANSIT') return false;
    if (activeTab === 'HISTORY' && item.status !== 'DELIVERED') return false;
    if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
    if (pickupFilter && !item.pickupAddress.toLowerCase().includes(pickupFilter.address.toLowerCase().split(',')[0])) return false;
    if (dropFilter && !item.dropAddress.toLowerCase().includes(dropFilter.address.toLowerCase().split(',')[0])) return false;
    return true;
  });

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-extrabold">
            <Package className="h-3.5 w-3.5 text-blue-400" />
            Co-Courier Peer Parcel Carry
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white md:text-4xl">Package Delivery</h1>
          <p className="max-w-xl text-xs sm:text-sm font-semibold text-slate-300">
            Send parcels with trusted commuters already traveling on your route. Zero extra emissions!
          </p>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="relative z-10 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-7 text-xs font-black shadow-xl shadow-blue-500/25 transition-all active:scale-95 cursor-pointer border border-blue-400/30"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Send a Package</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl max-w-fit text-xs font-extrabold">
          {[
            { id: 'ALL', label: 'All Requests' },
            { id: 'ACTIVE', label: 'Active Deliveries' },
            { id: 'HISTORY', label: 'Completed History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Category:
          </span>
          {['ALL', 'Documents', 'Electronics', 'Small Parcel', 'Food/Grocery'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-extrabold border transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Package Request Cards Grid */}
      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl shimmer-bg border border-slate-200" />
          ))}
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            📦
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">No package requests found</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1 max-w-md mx-auto">
              Be the first to request a package carry or try selecting a different category filter.
            </p>
          </div>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Send a Package Now</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDeliveries.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header: Title & Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      {item.category}
                    </span>
                    <h3 className="text-base font-black text-slate-900">{item.itemTitle}</h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold border shadow-2xs flex-shrink-0 ${
                      item.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'IN_TRANSIT'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {item.status === 'DELIVERED' ? '✓ Delivered' : item.status === 'IN_TRANSIT' ? '🚚 In Transit' : 'Pending Rider'}
                  </span>
                </div>

                {/* Pickup & Drop Addresses */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 mb-4 text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{item.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Flag className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{item.dropAddress}</span>
                  </div>
                </div>

                {/* Specs: Reward & Weight */}
                <div className="flex items-center justify-between text-xs font-extrabold mb-4 p-3 rounded-2xl bg-slate-900 text-white">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Reward Offered</p>
                    <p className="text-lg font-black text-emerald-400">₹{item.offeredReward}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Weight Class</p>
                    <p className="text-xs font-bold text-slate-200">{item.weightClass}</p>
                  </div>
                </div>
              </div>

              {/* Requester & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.requesterAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={item.requesterName}
                    className="h-8 w-8 rounded-full object-cover border border-blue-500/30"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.requesterName}</p>
                    <p className="text-[10px] font-semibold text-slate-400">Sender</p>
                  </div>
                </div>

                {item.status === 'OPEN' && (
                  <button
                    onClick={() => handleAcceptDelivery(item)}
                    className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1 cursor-pointer active:scale-95"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>Carry Parcel</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Send Package Request */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Request Package Carry</h3>
                <p className="text-xs font-semibold text-slate-500">Connect with co-travelers already on route</p>
              </div>
            </div>

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Item Description / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Important Legal Documents or Laptop Charger"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  className="block w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="block w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Documents">Documents</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Small Parcel">Small Parcel</option>
                    <option value="Heavy Item">Heavy Item</option>
                    <option value="Food/Grocery">Food/Grocery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Weight Class
                  </label>
                  <select
                    value={weightClass}
                    onChange={(e) => setWeightClass(e.target.value as any)}
                    className="block w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Under 1 kg">Under 1 kg</option>
                    <option value="1 - 5 kg">1 - 5 kg</option>
                    <option value="5 - 15 kg">5 - 15 kg</option>
                    <option value="15+ kg">15+ kg</option>
                  </select>
                </div>
              </div>

              <GooglePlacesInput
                label="Pickup Address"
                placeholder="Choose pickup address from Google"
                value={pickupAddress}
                onChange={setPickupAddress}
                icon={MapPin}
                required={true}
              />

              <GooglePlacesInput
                label="Drop Off Address"
                placeholder="Choose destination address from Google"
                value={dropAddress}
                onChange={setDropAddress}
                icon={Flag}
                required={true}
              />

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Offered Reward (₹)
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  value={offeredReward}
                  onChange={(e) => setOfferedReward(e.target.value)}
                  className="block w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Special Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Handle with care, call on arrival"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-13 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:bg-slate-400 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Publish Package Carry Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
