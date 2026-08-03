import React, { useState } from 'react';
import { X, Camera, ShieldCheck, MapPin, Car, Phone, User, Check, Sparkles, AlertCircle, Upload, Trash2, Image as ImageIcon, CheckCircle2, UserCheck, Shield, Loader2 } from 'lucide-react';
import type { AuthUser } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
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
}

// Curated avatar presets for quick selection
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
];

// Presets for vehicle verification photos
const PRESET_VEHICLE_FRONT = [
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80',
];

const PRESET_VEHICLE_REAR = [
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&auto=format&fit=crop&q=80',
];

const PRESET_OWNER_SELFIE = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
];

export default function EditProfileModal({ isOpen, onClose, user, onUpdateProfile }: EditProfileModalProps) {
  const [name, setName] = useState(user.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || PRESET_AVATARS[0]);
  const [phone, setPhone] = useState(user.profile?.phone || '');
  const [addressLine, setAddressLine] = useState(user.profile?.addressLine || '');
  const [city, setCity] = useState(user.profile?.city || '');
  const [state, setState] = useState(user.profile?.state || '');
  const [pincode, setPincode] = useState(user.profile?.pincode || '');
  const [vehicleNumber, setVehicleNumber] = useState(user.profile?.vehicleNumber || '');
  const [vehicleModel, setVehicleModel] = useState(user.profile?.vehicleModel || '');
  const [vehicleFrontUrl, setVehicleFrontUrl] = useState(user.profile?.vehicleFrontUrl || '');
  const [vehicleRearUrl, setVehicleRearUrl] = useState(user.profile?.vehicleRearUrl || '');
  const [ownerSelfieUrl, setOwnerSelfieUrl] = useState(user.profile?.ownerSelfieUrl || '');
  const [bio, setBio] = useState(user.profile?.bio || '');
  const [emergencyContact, setEmergencyContact] = useState(user.profile?.emergencyContact || '');

  const [activeTab, setActiveTab] = useState<'identity' | 'location' | 'vehicle' | 'contact'>('identity');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      await onUpdateProfile({
        name,
        avatarUrl,
        phone,
        addressLine,
        city,
        state,
        pincode,
        vehicleNumber,
        vehicleModel,
        vehicleFrontUrl,
        vehicleRearUrl,
        ownerSelfieUrl,
        bio,
        emergencyContact,
      });

      setSuccessMsg('Profile and security verification updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800/90 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-6 text-white relative border-b border-slate-800/80">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/30 border border-blue-500/40 rounded-2xl text-blue-400">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                Edit Profile & Security Verification <Sparkles className="h-4 w-4 text-blue-400" />
              </h2>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                Update avatar, address verification, and vehicle registration.
              </p>
            </div>
          </div>

          {/* Verification Progress Badges */}
          <div className="flex items-center gap-2.5 mt-5 pt-3 border-t border-slate-800 text-xs font-extrabold">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
              addressLine && city ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <MapPin className="h-3.5 w-3.5" />
              {addressLine && city ? 'Location Verified' : 'Location Pending'}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
              vehicleNumber && (vehicleFrontUrl || vehicleRearUrl || ownerSelfieUrl)
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                : vehicleNumber
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Car className="h-3.5 w-3.5" />
              {vehicleNumber && (vehicleFrontUrl || vehicleRearUrl || ownerSelfieUrl)
                ? 'Vehicle Verified'
                : vehicleNumber
                ? 'Photos Pending'
                : 'Vehicle Pending'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-6 pt-3 space-x-2 overflow-x-auto">
          {[
            { id: 'identity', label: 'Identity & Photo', icon: User },
            { id: 'location', label: 'Location Verification', icon: MapPin },
            { id: 'vehicle', label: 'Vehicle Verification', icon: Car },
            { id: 'contact', label: 'Contact & Bio', icon: Phone },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 pb-3 px-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  active 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-700 flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: IDENTITY & PHOTO */}
          {activeTab === 'identity' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                />
              </div>

              {/* Profile Photo Selector */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Profile Photo / Avatar
                </label>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative group">
                    <img
                      src={avatarUrl}
                      alt="Avatar Preview"
                      className="h-20 w-20 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
                    />
                    <label className="absolute inset-0 bg-slate-950/50 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="h-5 w-5" />
                      <input type="file" accept="image/*" onChange={handleCustomImageUpload} className="hidden" />
                    </label>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">Upload or Pick an Avatar</p>
                    <p className="text-[11px] font-semibold text-slate-500">
                      Click the picture to upload a custom photo or choose a preset below.
                    </p>
                  </div>
                </div>

                <p className="text-xs font-extrabold text-slate-500 mb-2">Choose Preset Avatar:</p>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        avatarUrl === url ? 'border-blue-600 ring-2 ring-blue-600/30 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-12 object-cover" />
                      {avatarUrl === url && (
                        <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center text-white">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOCATION VERIFICATION */}
          {activeTab === 'location' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-2xl flex items-start space-x-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 font-semibold leading-relaxed">
                  <strong className="block font-black text-blue-950 mb-0.5">Location Verification Security</strong>
                  Providing your primary residential or work address grants you a <strong>Verified Location Badge</strong> on your carpool listings, building trust with fellow commuters.
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Street Address / Flat / Building
                </label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. Plot 45, Patia Square, Near KIIT"
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bhubaneswar"
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Odisha"
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    PIN / Zipcode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="751024"
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLE VERIFICATION */}
          {activeTab === 'vehicle' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl flex items-start space-x-3">
                <Car className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 font-semibold leading-relaxed">
                  <strong className="block font-black text-emerald-950 mb-0.5">Driver & Vehicle Verification</strong>
                  Upload photos of your vehicle (<strong>Front view with license plate</strong>, <strong>Rear view</strong>) along with a <strong>Selfie with the owner</strong> to get full vehicle verification.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Vehicle Registration Number
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. OD 02 AB 1234"
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-black text-slate-900 tracking-wider focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/10 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Vehicle Brand & Model
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Tesla Model Y / Tata Nexon EV / Hyundai Creta"
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                  />
                </div>
              </div>

              {/* Vehicle Verification Photos Section */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-blue-600" />
                    Vehicle & Owner Verification Photos
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400">3 Photos Required</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Photo 1: Vehicle Front Photo */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          <Car className="h-3.5 w-3.5 text-blue-600" /> Front View
                        </span>
                        {vehicleFrontUrl ? (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="h-3 w-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-200/70 px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 mb-2">
                        Front photo showing license plate
                      </p>

                      {vehicleFrontUrl ? (
                        <div className="relative group rounded-xl overflow-hidden border border-slate-300 h-36 bg-slate-900">
                          <img
                            src={vehicleFrontUrl}
                            alt="Vehicle Front"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg cursor-pointer backdrop-blur-sm transition-all" title="Change Front Photo">
                              <Upload className="h-4 w-4" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoFileUpload(e, setVehicleFrontUrl)}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setVehicleFrontUrl('')}
                              className="p-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg backdrop-blur-sm transition-all"
                              title="Remove Photo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-300 rounded-xl h-36 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group">
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform mb-1.5">
                            <Camera className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-700">Upload Front Photo</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG or WebP</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoFileUpload(e, setVehicleFrontUrl)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Presets */}
                    <div className="pt-2 border-t border-slate-200/70">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quick Sample:</p>
                      <div className="flex gap-1.5">
                        {PRESET_VEHICLE_FRONT.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setVehicleFrontUrl(url)}
                            className={`flex-1 h-8 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              vehicleFrontUrl === url ? 'border-blue-600 ring-1 ring-blue-600' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt={`Front ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Photo 2: Vehicle Rear Photo */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          <Car className="h-3.5 w-3.5 text-blue-600" /> Rear View
                        </span>
                        {vehicleRearUrl ? (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="h-3 w-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-200/70 px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 mb-2">
                        Rear side view of the vehicle
                      </p>

                      {vehicleRearUrl ? (
                        <div className="relative group rounded-xl overflow-hidden border border-slate-300 h-36 bg-slate-900">
                          <img
                            src={vehicleRearUrl}
                            alt="Vehicle Rear"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg cursor-pointer backdrop-blur-sm transition-all" title="Change Rear Photo">
                              <Upload className="h-4 w-4" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoFileUpload(e, setVehicleRearUrl)}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setVehicleRearUrl('')}
                              className="p-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg backdrop-blur-sm transition-all"
                              title="Remove Photo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-300 rounded-xl h-36 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group">
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform mb-1.5">
                            <Camera className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-700">Upload Rear Photo</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG or WebP</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoFileUpload(e, setVehicleRearUrl)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Presets */}
                    <div className="pt-2 border-t border-slate-200/70">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quick Sample:</p>
                      <div className="flex gap-1.5">
                        {PRESET_VEHICLE_REAR.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setVehicleRearUrl(url)}
                            className={`flex-1 h-8 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              vehicleRearUrl === url ? 'border-blue-600 ring-1 ring-blue-600' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt={`Rear ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Photo 3: Owner Selfie */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          <UserCheck className="h-3.5 w-3.5 text-blue-600" /> Owner Selfie
                        </span>
                        {ownerSelfieUrl ? (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="h-3 w-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-200/70 px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 mb-2">
                        Selfie photo of owner with vehicle
                      </p>

                      {ownerSelfieUrl ? (
                        <div className="relative group rounded-xl overflow-hidden border border-slate-300 h-36 bg-slate-900">
                          <img
                            src={ownerSelfieUrl}
                            alt="Owner Selfie"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg cursor-pointer backdrop-blur-sm transition-all" title="Change Selfie Photo">
                              <Upload className="h-4 w-4" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoFileUpload(e, setOwnerSelfieUrl)}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setOwnerSelfieUrl('')}
                              className="p-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg backdrop-blur-sm transition-all"
                              title="Remove Photo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-300 rounded-xl h-36 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group">
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform mb-1.5">
                            <Camera className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-700">Upload Owner Selfie</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG or WebP</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoFileUpload(e, setOwnerSelfieUrl)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Presets */}
                    <div className="pt-2 border-t border-slate-200/70">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quick Sample:</p>
                      <div className="flex gap-1.5">
                        {PRESET_OWNER_SELFIE.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setOwnerSelfieUrl(url)}
                            className={`flex-1 h-8 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              ownerSelfieUrl === url ? 'border-blue-600 ring-1 ring-blue-600' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt={`Selfie ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT & BIO */}
          {activeTab === 'contact' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Emergency Contact Number
                  </label>
                  <input
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Emergency phone number"
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Bio / Commute Tagline
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a brief tagline or travel preference (e.g. IT professional commuting daily from Patia to Infocity, podcast listener)."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/10 resize-none"
                />
              </div>
            </div>
          )}

          {/* Action Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50 cursor-pointer border border-blue-400/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save Security Profile</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
