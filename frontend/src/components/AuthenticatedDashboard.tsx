import { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { apiUrl } from '../utils/api';
import {
  Bell,
  Calendar,
  Car,
  ChevronRight,
  CreditCard,
  Flag,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Navigation,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Star,
  User,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { AuthUser, LocationSelection, Ride, UserNotification } from '../types';
import SearchForm from './SearchForm';
import RidesList from './RidesList';
import CarbonDashboard from './CarbonDashboard';
import EditProfileModal from './EditProfileModal';
import PackageDeliverySection from './PackageDeliverySection';
import FreelanceRidersSection from './FreelanceRidersSection';
import LiveTrackingModal from './LiveTrackingModal';

type DashboardView =
  | 'dashboard'
  | 'find'
  | 'offer'
  | 'delivery'
  | 'freelancers'
  | 'trips'
  | 'messages'
  | 'eco'
  | 'wallet'
  | 'profile';

interface AuthenticatedDashboardProps {
  user: AuthUser;
  rides: Ride[];
  joinedRideIds: string[];
  userRequests?: Record<string, 'PENDING' | 'ACCEPTED' | 'REJECTED'>;
  onSearch: (filters: { pickupLocation: LocationSelection | null; destinationLocation: LocationSelection | null; date: string }) => Promise<void>;
  onJoinRide: (ride: Ride) => void;
  onOpenChat: (ride: Ride) => void;
  onOfferRideClick: () => void;
  onSignOut: () => void;
  onUpdateProfile: (updatedData: {
    name?: string;
    avatarUrl?: string;
    phone?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    pincode?: string;
    vehicleNumber?: string;
    vehicleModel?: string;
    vehicleFrontUrl?: string;
    vehicleRearUrl?: string;
    ownerSelfieUrl?: string;
    bio?: string;
    emergencyContact?: string;
  }) => Promise<void>;
  isExactMatchFound?: boolean;
  searchQueryInfo?: { pickupAddress?: string; destinationAddress?: string; date?: string } | null;
  onClearFilter?: () => void;
}

const navItems: Array<{ id: DashboardView; label: string; icon: typeof Car }> = [
  { id: 'dashboard', label: 'Dashboard', icon: Car },
  { id: 'find', label: 'Find a Ride', icon: Search },
  { id: 'offer', label: 'Offer a Ride', icon: Plus },
  { id: 'delivery', label: 'Package Delivery', icon: Package },
  { id: 'freelancers', label: 'Freelance Riders', icon: Zap },
  { id: 'trips', label: 'My Trips', icon: Calendar },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'eco', label: 'Eco', icon: Leaf },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
];

function getInitials(user: AuthUser) {
  const source = user.name || user.email;
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Car;
  tone: 'blue' | 'green' | 'gold';
}) {
  const toneClass = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    gold: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  }[tone];

  const gradientBorder = {
    blue: 'hover:border-blue-300',
    green: 'hover:border-emerald-300',
    gold: 'hover:border-amber-300',
  }[tone];

  return (
    <div className={`rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${gradientBorder}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
        <span className={`rounded-2xl border p-3.5 shadow-sm ${toneClass}`}>
          <Icon className="h-6 w-6" />
        </span>
      </div>
      <p className="mt-4 text-xs font-bold text-slate-500 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        {detail}
      </p>
    </div>
  );
}

const RideMiniCard: FC<{ ride: Ride; onOpenChat: (ride: Ride) => void; user: AuthUser }> = ({ ride, onOpenChat, user }) => {
  const [isTrackOpen, setIsTrackOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={ride.driverAvatar} alt={ride.driverName} className="h-12 w-12 rounded-full object-cover border-2 border-blue-500/20" />
            <div>
              <p className="text-sm font-black text-slate-900">{ride.driverName}</p>
              <p className="text-xs font-semibold text-slate-500">{ride.time} · {ride.carModel}</p>
            </div>
          </div>
          <div className="flex items-center text-xs font-extrabold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex-shrink-0">
            <Star className="mr-1 h-3.5 w-3.5 fill-current text-amber-400" />
            {ride.driverRating.toFixed(1)}
          </div>
        </div>
        <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-3.5 text-xs font-bold text-slate-700 border border-slate-100">
          <span className="flex items-center gap-2 truncate"><MapPin className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />{ride.leavingFrom}</span>
          <span className="flex items-center gap-2 truncate"><Flag className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />{ride.goingTo}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setIsTrackOpen(true)}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-extrabold transition-all hover:bg-emerald-600 hover:text-white cursor-pointer shadow-2xs"
          title="Track Rider Live GPS Location"
        >
          <Navigation className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
          <span>Track Live</span>
        </button>

        <button
          onClick={() => onOpenChat(ride)}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-extrabold text-slate-700 transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600 cursor-pointer"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Open Chat</span>
        </button>
      </div>

      {isTrackOpen && (
        <LiveTrackingModal ride={ride} onClose={() => setIsTrackOpen(false)} currentUser={user} />
      )}
    </div>
  );
};

const MyTripItem: FC<{ ride: Ride; onOpenChat: (ride: Ride) => void; user: AuthUser }> = ({ ride, onOpenChat, user }) => {
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-extrabold mb-2">
            {ride.date} · {ride.time}
          </span>
          <h3 className="text-lg font-black text-slate-900">{ride.leavingFrom} ➔ {ride.goingTo}</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">Driver: {ride.driverName} · {ride.seatsAvailable} seats open</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTrackOpen(true)}
            className="h-11 inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 text-xs font-extrabold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer shadow-2xs"
          >
            <Navigation className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            <span>Track Live</span>
          </button>
          <button onClick={() => onOpenChat(ride)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-5 text-xs font-extrabold text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors cursor-pointer">
            Open Secure Chat
          </button>
        </div>
      </div>
      {isTrackOpen && (
        <LiveTrackingModal ride={ride} onClose={() => setIsTrackOpen(false)} currentUser={user} />
      )}
    </div>
  );
};

export default function AuthenticatedDashboard({
  user,
  rides,
  joinedRideIds,
  userRequests = {},
  onSearch,
  onJoinRide,
  onOpenChat,
  onOfferRideClick,
  onSignOut,
  onUpdateProfile,
  isExactMatchFound = true,
  searchQueryInfo = null,
  onClearFilter,
}: AuthenticatedDashboardProps) {
  const [view, setView] = useState<DashboardView>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const initials = getInitials(user);
  const joinedRides = useMemo(() => rides.filter((ride) => joinedRideIds.includes(ride.id)), [rides, joinedRideIds]);
  const upcomingRides = joinedRides.length > 0 ? joinedRides : rides.slice(0, 2);
  const savedKg = upcomingRides.reduce((total, ride) => total + ride.carbonSaved, 0);

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userConversations, setUserConversations] = useState<Ride[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(apiUrl('/api/notifications'), { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchUserConversations = async () => {
    try {
      const res = await fetch(apiUrl('/api/rides/user-conversations'), { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUserConversations(data);
      }
    } catch (err) {
      console.error('Error fetching user conversations:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUserConversations();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUserConversations();
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await fetch(apiUrl('/api/notifications/read-all'), { method: 'PATCH', credentials: 'include' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  // Automatically switch to 'find' tab whenever search query info is updated
  useEffect(() => {
    if (searchQueryInfo) {
      setView('find');
    }
  }, [searchQueryInfo]);

  const selectView = (nextView: DashboardView) => {
    setView(nextView);
    setMobileNavOpen(false);
  };

  const handleSearchSubmit = async (filters: { pickupLocation: LocationSelection | null; destinationLocation: LocationSelection | null; date: string }) => {
    await onSearch(filters);
    setView('find');
    setTimeout(() => {
      const el = document.getElementById('search-results-anchor');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const renderView = () => {
    if (view === 'find') {
      return (
        <div className="space-y-6">
          <HeaderBlock title="Find a Ride" subtitle="Match with verified community rides near your commute." />
          <SearchForm onSearch={handleSearchSubmit} />
          <RidesList
            rides={rides}
            onJoinRide={onJoinRide}
            onOpenChat={onOpenChat}
            joinedRideIds={joinedRideIds}
            userRequests={userRequests}
            currentUserId={user.id}
            isExactMatchFound={isExactMatchFound}
            searchQueryInfo={searchQueryInfo}
            onOfferRideClick={onOfferRideClick}
            onClearFilter={onClearFilter}
          />
        </div>
      );
    }

    if (view === 'offer') {
      return (
        <div className="space-y-6">
          <HeaderBlock title="Offer a Ride" subtitle="Publish an available route and help neighbors travel cleaner." />
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              <div className="space-y-5">
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 border border-blue-100">
                  <p className="text-xs font-black uppercase tracking-wider text-blue-600">Quick Setup</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900">List your next commute in under a minute.</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                    Add route details, departure time, available seats, vehicle specs, and preference tags so co-travelers can find your trip easily.
                  </p>
                </div>
                <button
                  onClick={onOfferRideClick}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-7 text-sm font-black text-white shadow-xl shadow-blue-600/20 transition-all active:scale-95 cursor-pointer border border-blue-400/20"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>Create Ride Listing</span>
                </button>
              </div>
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-6 flex flex-col justify-between">
                <div>
                  <Leaf className="h-8 w-8 text-emerald-600" />
                  <p className="mt-4 text-4xl font-black text-emerald-700 tracking-tight">100%</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-800 uppercase tracking-wider">Free Community Rides</p>
                </div>
                <p className="mt-4 text-xs font-semibold leading-relaxed text-slate-600">
                  Lift keeps zero pricing fees so neighbors focus on trust, safety, and saving carbon emissions together.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (view === 'delivery') {
      return <PackageDeliverySection rides={rides} currentUser={user} onOpenChat={onOpenChat} />;
    }

    if (view === 'freelancers') {
      return (
        <FreelanceRidersSection
          currentUser={user}
          onOpenChat={onOpenChat}
          onNavigateToProfile={() => setView('profile')}
        />
      );
    }

    if (view === 'trips') {
      return (
        <div className="space-y-6">
          <HeaderBlock title="My Trips" subtitle="Track rides you joined and routes you are offering." />
          <div className="grid gap-4">
            {upcomingRides.map((ride) => (
              <MyTripItem key={ride.id} ride={ride} onOpenChat={onOpenChat} user={user} />
            ))}
          </div>
        </div>
      );
    }

    if (view === 'messages') {
      const activeConversations = userConversations.length > 0 ? userConversations : rides.slice(0, 6);

      return (
        <div className="space-y-6">
          <HeaderBlock title="Messages & Task Requests" subtitle="Encrypted conversations for freelancing tasks, route coordination, and price discussions." />
          
          {userConversations.length === 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-semibold text-blue-800">
              ⚡ Showing community directory channels. Hire a freelance rider or request a ride pool to start direct encrypted messaging!
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeConversations.map((ride) => <RideMiniCard key={ride.id} ride={ride} onOpenChat={onOpenChat} user={user} />)}
          </div>
        </div>
      );
    }

    if (view === 'eco') {
      return <CarbonDashboard onBackClick={() => setView('dashboard')} />;
    }

    if (view === 'wallet') {
      return (
        <div className="space-y-6">
          <HeaderBlock title="My Wallet" subtitle="Credits, ride passes, and shared commute rewards." />
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-7 text-white shadow-xl border border-slate-800">
              <CreditCard className="h-8 w-8 text-blue-400" />
              <p className="mt-8 text-xs font-extrabold uppercase tracking-wider text-slate-400">Lift Community Balance</p>
              <p className="mt-2 text-4xl font-black text-white tracking-tight">$0.00</p>
              <p className="mt-4 text-xs font-semibold text-slate-300">Community carpooling is 100% free with zero commission.</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm">
              <p className="text-base font-black text-slate-900">Eco Rewards & Badges</p>
              <div className="mt-6 space-y-4 text-xs font-bold text-slate-600">
                <p className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl"><span>Eco Carbon Credits</span><strong className="text-emerald-600 text-sm">1,240 pts</strong></p>
                <p className="flex items-center justify-between p-3 bg-blue-50 rounded-xl"><span>Verified Trips</span><strong className="text-blue-600 text-sm">{joinedRideIds.length}</strong></p>
                <p className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"><span>Community Passes</span><strong className="text-slate-800 text-sm">3 Available</strong></p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (view === 'profile') {
      const isLocVerified = Boolean(user.profile?.locationVerified || (user.profile?.addressLine && user.profile?.city));
      const isDriverVerified = Boolean(user.profile?.verifiedDriver || user.profile?.vehicleNumber);

      return (
        <div className="space-y-6">
          <HeaderBlock title="Profile & Security Verification" subtitle="Manage identity, avatar photo, address verification, and vehicle registration." />
          
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6">
              <div className="flex items-center gap-5">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name || 'User Avatar'} className="h-20 w-20 rounded-2xl object-cover border-2 border-blue-500 shadow-lg shadow-blue-500/20" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-2xl font-black text-white shadow-lg shadow-blue-500/20">{initials}</div>
                )}
                <div>
                  <h3 className="text-2xl font-black text-white">{user.name || 'Lift Rider'}</h3>
                  <p className="text-sm font-semibold text-slate-400">{user.email}</p>
                  
                  {/* Security Verification Badges */}
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-0.5 text-xs font-extrabold text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      Verified Member
                    </span>
                    {isLocVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-0.5 text-xs font-extrabold text-blue-300">
                        <MapPin className="h-3.5 w-3.5 text-blue-400" />
                        Location Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-3 py-0.5 text-xs font-extrabold text-slate-400">
                        <MapPin className="h-3.5 w-3.5" />
                        Location Pending
                      </span>
                    )}
                    {isDriverVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-0.5 text-xs font-extrabold text-indigo-300">
                        <Car className="h-3.5 w-3.5 text-indigo-400" />
                        Verified Driver ({user.profile?.vehicleNumber})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-3 py-0.5 text-xs font-extrabold text-slate-400">
                        <Car className="h-3.5 w-3.5" />
                        Vehicle Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsEditProfileOpen(true)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-7 text-xs font-extrabold shadow-xl shadow-blue-600/30 transition-all active:scale-95 cursor-pointer border border-blue-400/30"
              >
                <Settings className="h-4 w-4" />
                <span>Edit Profile & Security</span>
              </button>
            </div>

            {/* Profile Security Details Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800/90 space-y-3 shadow-md">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-blue-400" /> Location & Contact Verification
                </h4>
                <div className="text-xs font-bold text-slate-200 space-y-2.5">
                  <p><span className="text-slate-400 font-medium">Address:</span> {user.profile?.addressLine || 'Not provided'}</p>
                  <p><span className="text-slate-400 font-medium">City/State:</span> {user.profile?.city ? `${user.profile.city}, ${user.profile.state || ''}` : 'Not provided'}</p>
                  <p><span className="text-slate-400 font-medium">Pincode:</span> {user.profile?.pincode || 'Not provided'}</p>
                  <p><span className="text-slate-400 font-medium">Mobile Phone:</span> {user.profile?.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800/90 space-y-4 shadow-md">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-emerald-400" /> Vehicle Registration & Verification
                </h4>
                <div className="text-xs font-bold text-slate-200 space-y-2.5">
                  <p><span className="text-slate-400 font-medium">Vehicle Reg Number:</span> <strong className="font-mono text-white bg-slate-800 px-2 py-0.5 rounded">{user.profile?.vehicleNumber || 'Not registered'}</strong></p>
                  <p><span className="text-slate-400 font-medium">Vehicle Model:</span> {user.profile?.vehicleModel || 'Not registered'}</p>
                  <p><span className="text-slate-400 font-medium">Emergency Contact:</span> {user.profile?.emergencyContact || 'Not provided'}</p>
                  <p><span className="text-slate-400 font-medium">Bio Tagline:</span> {user.profile?.bio || 'Daily commuter'}</p>
                </div>

                {/* Verification Photos Preview */}
                <div className="pt-3.5 border-t border-slate-800 space-y-2.5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Verification Photos (Front, Rear, Owner Selfie)
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1 text-center">
                      {user.profile?.vehicleFrontUrl ? (
                        <img
                          src={user.profile.vehicleFrontUrl}
                          alt="Front View"
                          className="h-16 w-full object-cover rounded-xl border border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className="h-16 w-full bg-slate-950/70 rounded-xl flex flex-col items-center justify-center text-[10px] text-slate-500 font-semibold border border-dashed border-slate-800">
                          No Front Photo
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-slate-400 block">Front View</span>
                    </div>

                    <div className="space-y-1 text-center">
                      {user.profile?.vehicleRearUrl ? (
                        <img
                          src={user.profile.vehicleRearUrl}
                          alt="Rear View"
                          className="h-16 w-full object-cover rounded-xl border border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className="h-16 w-full bg-slate-950/70 rounded-xl flex flex-col items-center justify-center text-[10px] text-slate-500 font-semibold border border-dashed border-slate-800">
                          No Rear Photo
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-slate-400 block">Rear View</span>
                    </div>

                    <div className="space-y-1 text-center">
                      {user.profile?.ownerSelfieUrl ? (
                        <img
                          src={user.profile.ownerSelfieUrl}
                          alt="Owner Selfie"
                          className="h-16 w-full object-cover rounded-xl border border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className="h-16 w-full bg-slate-950/70 rounded-xl flex flex-col items-center justify-center text-[10px] text-slate-500 font-semibold border border-dashed border-slate-800">
                          No Owner Selfie
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-slate-400 block">Owner Selfie</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      );
    }

    return (
      <div className="space-y-7">
        <HeaderBlock title={`Welcome back, ${user.name?.split(' ')[0] || 'Rider'} 👋`} subtitle="Your Lift ride-sharing command center is live." />
        
        {/* Stat Cards Grid */}
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard label="Upcoming trips" value={String(upcomingRides.length)} detail="Matched ride pools" icon={Calendar} tone="blue" />
          <StatCard label="CO2 offset" value={`${savedKg.toFixed(1)} kg`} detail="From commute activity" icon={Leaf} tone="green" />
          <StatCard label="Eco Rewards" value="1,240" detail="Active community points" icon={Wallet} tone="gold" />
        </div>

        {/* Recommended rides & Quick actions */}
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Recommended Matching Pools</h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Top routes matching your commute</p>
              </div>
              <button onClick={() => setView('find')} className="flex items-center gap-1 text-xs font-extrabold text-blue-600 hover:text-blue-700 cursor-pointer">
                View all <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {rides.slice(0, 2).map((ride) => <RideMiniCard key={ride.id} ride={ride} onOpenChat={onOpenChat} />)}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Quick Actions</h3>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Shortcuts for daily commuting</p>

            <div className="mt-6 grid gap-3.5">
              <button onClick={() => setView('find')} className="flex h-13 items-center justify-between rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 px-5 text-xs font-extrabold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer group">
                <span className="flex items-center gap-2.5">
                  <span className="p-2 bg-blue-500/10 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><Search className="h-4 w-4" /></span>
                  Find a Ride Pool
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button onClick={onOfferRideClick} className="flex h-13 items-center justify-between rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 px-5 text-xs font-extrabold text-slate-800 hover:text-emerald-600 transition-colors cursor-pointer group">
                <span className="flex items-center gap-2.5">
                  <span className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Plus className="h-4 w-4" /></span>
                  Offer a Ride as Driver
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button onClick={() => setView('messages')} className="flex h-13 items-center justify-between rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 px-5 text-xs font-extrabold text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer group">
                <span className="flex items-center gap-2.5">
                  <span className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors"><MessageSquare className="h-4 w-4" /></span>
                  Encrypted Messages
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sleek Glass Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-800 bg-slate-950 px-5 py-5 lg:flex lg:flex-col justify-between shadow-2xl overflow-y-auto max-h-screen">
        <DashboardNav view={view} onSelect={selectView} user={user} initials={initials} onSignOut={onSignOut} />
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md lg:hidden">
          <div className="h-full w-80 max-w-[86vw] bg-slate-950 px-5 py-5 shadow-2xl border-r border-slate-800 overflow-y-auto flex flex-col justify-between">
            <div className="mb-2 flex justify-end">
              <button onClick={() => setMobileNavOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <DashboardNav view={view} onSelect={selectView} user={user} initials={initials} onSignOut={onSignOut} />
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-xs">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button onClick={() => setMobileNavOpen(true)} className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 lg:flex">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-extrabold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Command Center
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative rounded-full border border-slate-200 bg-slate-50 p-2.5 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                  title="Notifications & Task Requests"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 ? (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-md animate-pulse">
                      {unreadCount}
                    </span>
                  ) : (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-emerald-400" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-blue-400 hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-xs font-semibold">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={async () => {
                              if (!n.isRead) {
                                try {
                                  await fetch(apiUrl(`/api/notifications/${n.id}/read`), { method: 'PATCH', credentials: 'include' });
                                  setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)));
                                } catch (e) {}
                              }
                              if (n.ride) {
                                setIsNotificationsOpen(false);
                                onOpenChat(n.ride);
                              }
                            }}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                              !n.isRead
                                ? 'bg-slate-900 border-blue-500/40 shadow-md'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                                <Zap className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                {n.title}
                              </h5>
                              <span className="text-[9px] font-bold text-slate-500 flex-shrink-0">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-300 leading-tight">{n.message}</p>
                            {n.ride && (
                              <span className="text-[10px] font-extrabold text-blue-400 hover:underline inline-block pt-1">
                                Click to open task chat ➔
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setView('profile')} className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-slate-50 py-1 pl-1.5 pr-4 hover:border-blue-500 transition-colors">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name || 'User Avatar'} className="h-8 w-8 rounded-full object-cover border border-blue-500/40 shadow-xs" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-black text-white">{initials}</span>
                )}
                <span className="hidden text-xs font-extrabold text-slate-800 sm:inline">{user.name || user.email}</span>
              </button>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{renderView()}</main>
      </div>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        onUpdateProfile={onUpdateProfile}
      />
    </div>
  );
}

function HeaderBlock({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Lift Ride-Sharing Dashboard</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{title}</h1>
      <p className="mt-1 max-w-2xl text-xs sm:text-sm font-semibold text-slate-500">{subtitle}</p>
    </div>
  );
}

function DashboardNav({
  view,
  onSelect,
  user,
  initials,
  onSignOut,
}: {
  view: DashboardView;
  onSelect: (view: DashboardView) => void;
  user: AuthUser;
  initials: string;
  onSignOut: () => void;
}) {
  return (
    <div className="flex h-full flex-col text-white justify-between">
      <div>
        <div className="flex items-center gap-3 px-2">
          <div className="rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 text-white shadow-lg shadow-blue-500/20">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight text-white">Lift</p>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">Green Mobility</p>
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`flex h-10 w-full items-center gap-3 rounded-xl px-3.5 text-xs font-extrabold transition-all cursor-pointer ${
                  active 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 border border-blue-400/30' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-900">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-3">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name || 'User Avatar'} className="h-9 w-9 rounded-xl object-cover border border-blue-500/40 shadow-sm flex-shrink-0" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-black text-white shadow-md flex-shrink-0">{initials}</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black text-white leading-tight">{user.name || 'Lift Rider'}</p>
              <p className="truncate text-[10px] font-semibold text-slate-400 mt-0.5">{user.email}</p>
            </div>
          </div>
          <button onClick={onSignOut} className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-slate-800/90 hover:bg-rose-600/20 text-xs font-bold text-slate-300 hover:text-rose-400 transition-colors cursor-pointer border border-slate-700">
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
