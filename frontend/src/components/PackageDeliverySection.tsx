import React, { useState, useEffect } from 'react';
import { Package, MapPin, Flag, Plus, Send, Check, ShieldCheck, Sparkles, Truck, Search, Loader2, MessageSquare, IndianRupee, Clock, ArrowRight, User } from 'lucide-react';
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
        
        // Find matching ride or create dummy ride for chat drawer
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

  // Filter traveler rides matching route
  const filteredRides = rides.filter((ride) => {
    if (!pickupFilter && !dropFilter) return true;
    const matchPickup = !pickupFilter || ride.leavingFrom.toLowerCase().includes(pickupFilter.address.toLowerCase().split(',')[0]);
    const matchDrop = !dropFilter || ride.goingTo.toLowerCase().includes(dropFilter.address.toLowerCase().split(',')[0]);
    return matchPickup && matchDrop;
  });

  // Filter package requests
  const filteredDeliveries = deliveries.filter((item) => {
    if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
    if (pickupFilter && !item.pickupAddress.toLowerCase().includes(pickupFilter.address.toLowerCase().split(',')[0])) return false;
    if (dropFilter && !item.dropAddress.toLowerCase().includes(dropFilter.address.toLowerCase().split(',')[0])) return false;
    return true;
  });

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-extrabold">
            <Package className="h-3.5 w-3.5 text-blue-400" />
            Co-Courier Peer Parcel Carry
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Send Packages with Traveling Neighbors 📦
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-300 max-w-2xl leading-relaxed">
            Need an item or document picked up from Bhubaneswar, Puri, or Cuttack? Co-travelers already heading on that route can carry your parcel for a quick reward tip.
          </p>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-7 text-xs font-extrabold text-white shadow-xl shadow-blue-600/30 transition-all active:scale-95 cursor-pointer border border-blue-400/30 whitespace-nowrap flex-shrink-0 relative z-10"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Post Package Request</span>
        </button>
      </div>

      {/* Route Filter Bar */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/90 backdrop-blur-xl p-6 shadow-md grid gap-4 md:grid-cols-3 items-end">
        <GooglePlacesInput
          label="Pickup Location"
          placeholder="Filter pickup city/area"
          value={pickupFilter}
          onChange={setPickupFilter}
          icon={MapPin}
          compact
          required={false}
        />
        <GooglePlacesInput
          label="Drop Location"
          placeholder="Filter destination city/area"
          value={dropFilter}
          onChange={setDropFilter}
          icon={Flag}
          compact
          required={false}
        />
        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="Documents">📄 Documents</option>
            <option value="Electronics">💻 Electronics</option>
            <option value="Small Parcel">📦 Small Parcel</option>
            <option value="Food/Grocery">🍱 Food & Sweets</option>
            <option value="Heavy Item">📦 Heavy Item</option>
          </select>
          {(pickupFilter || dropFilter || filterCategory !== 'ALL') && (
            <button
              onClick={() => {
                setPickupFilter(null);
                setDropFilter(null);
                setFilterCategory('ALL');
              }}
              className="h-11 px-4 text-xs font-extrabold text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Traveling Co-Couriers + Open Package Requests */}
      <div className="grid gap-7 lg:grid-cols-[1fr_1.1fr]">
        
        {/* Section A: Active Travelers Heading Your Way */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Travelers Passing This Route
            </h3>
            <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {filteredRides.length} Available
            </span>
          </div>

          <div className="space-y-3.5">
            {filteredRides.slice(0, 4).map((ride) => (
              <div key={ride.id} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={ride.driverAvatar} alt={ride.driverName} className="h-11 w-11 rounded-xl object-cover border border-blue-500/30" />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        {ride.driverName}
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-500">{ride.carModel} · {ride.time}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    Can Carry Parcel
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-700 space-y-1.5 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Route:</span>
                    <span className="text-slate-900">{ride.leavingFrom} ➔ {ride.goingTo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vehicle Space:</span>
                    <span className="text-blue-600">{ride.seatsAvailable} seats / boot space open</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenChat(ride)}
                  className="w-full h-10 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-extrabold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Request Co-Courier Carry</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section B: Open Package Delivery Requests Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              Open Parcel Delivery Listings
            </h3>
            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {filteredDeliveries.length} Requests
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-xs font-bold">Loading parcel delivery listings...</p>
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-3">
              <Package className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-base font-black text-slate-800">No open parcel requests match filter</h4>
              <p className="text-xs text-slate-500 font-semibold">Post a request or clear filter criteria to view all parcel listings.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredDeliveries.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-200">
                          {item.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {item.weightClass}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 mt-2">{item.itemTitle}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-emerald-600 flex items-center justify-end">
                        ₹{item.offeredReward}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400">Offered Tip</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-700 space-y-1.5 border border-slate-100">
                    <p className="flex items-center gap-2 text-slate-800 truncate">
                      <MapPin className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                      <span>Pickup: <strong className="text-slate-900">{item.pickupAddress}</strong></span>
                    </p>
                    <p className="flex items-center gap-2 text-slate-800 truncate">
                      <Flag className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Drop: <strong className="text-slate-900">{item.dropAddress}</strong></span>
                    </p>
                    {item.notes && <p className="text-slate-500 italic text-[11px] pt-1">"{item.notes}"</p>}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      {item.requesterAvatar ? (
                        <img src={item.requesterAvatar} alt={item.requesterName} className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">{item.requesterName[0]}</div>
                      )}
                      <span>Posted by {item.requesterName}</span>
                    </div>

                    {item.status === 'ACCEPTED' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <Check className="h-3.5 w-3.5" /> Matched with Traveler
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcceptDelivery(item)}
                        className="h-9 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer border border-emerald-400/30 flex items-center gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Accept & Carry Parcel</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Post Package Delivery Request Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800/90 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-6 text-white border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-600/30 border border-blue-500/40 rounded-2xl text-blue-400">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Post Package Delivery Request</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Match with traveling commuters to carry your parcel.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePostSubmit} className="p-6 space-y-5">
              {successMsg && (
                <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-extrabold text-emerald-300 flex items-center gap-2">
                  <Check className="h-4 w-4" /> {successMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                  Item Title / Description
                </label>
                <input
                  type="text"
                  required
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="e.g. Legal Contract Envelope, Laptop Charger, Food Box"
                  className="w-full h-12 px-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-12 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500"
                  >
                    <option value="Documents">📄 Documents</option>
                    <option value="Electronics">💻 Electronics</option>
                    <option value="Small Parcel">📦 Small Parcel</option>
                    <option value="Food/Grocery">🍱 Food & Sweets</option>
                    <option value="Heavy Item">📦 Heavy Item</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                    Weight Class
                  </label>
                  <select
                    value={weightClass}
                    onChange={(e) => setWeightClass(e.target.value as any)}
                    className="w-full h-12 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500"
                  >
                    <option value="Under 1 kg">Under 1 kg</option>
                    <option value="1 - 5 kg">1 - 5 kg</option>
                    <option value="5 - 15 kg">5 - 15 kg</option>
                    <option value="15+ kg">15+ kg</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <GooglePlacesInput
                  label="Pickup Address"
                  placeholder="Enter pickup location / landmark"
                  value={pickupAddress}
                  onChange={setPickupAddress}
                  icon={MapPin}
                  compact
                />
                <GooglePlacesInput
                  label="Drop Address"
                  placeholder="Enter drop location / landmark"
                  value={dropAddress}
                  onChange={setDropAddress}
                  icon={Flag}
                  compact
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                  Offered Tip / Reward Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  value={offeredReward}
                  onChange={(e) => setOfferedReward(e.target.value)}
                  placeholder="200"
                  className="w-full h-12 px-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-emerald-400 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                  Notes for Traveler (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Handle with care, pick up before 5 PM from gate 2."
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-extrabold text-slate-400 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>Publish Delivery Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
