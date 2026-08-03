import React, { useState, useEffect, useRef } from 'react';
import { Message, Ride, RideRequestInfo } from '../types';
import { X, Send, ShieldCheck, Star, Clock, CheckCircle2, XCircle, SendHorizontal, Lock } from 'lucide-react';

interface ChatDrawerProps {
  ride: Ride;
  onClose: () => void;
}

export default function ChatDrawer({ ride, onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [userRequestStatus, setUserRequestStatus] = useState<string | null>(null);
  const [driverRequests, setDriverRequests] = useState<RideRequestInfo[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchRequestStatus = async () => {
    try {
      const res = await fetch(`/api/rides/${ride.id}/request-status`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setIsDriver(data.isDriver);
        if (data.isDriver) {
          setDriverRequests(data.requests || []);
        } else {
          setUserRequestStatus(data.request ? data.request.status : null);
        }
      }
    } catch (err) {
      console.error('Error fetching request status:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/rides/${ride.id}/messages`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  useEffect(() => {
    fetchRequestStatus();
    fetchMessages();
    const interval = setInterval(() => {
      fetchRequestStatus();
      fetchMessages();
    }, 2000);
    return () => clearInterval(interval);
  }, [ride.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendRequest = async () => {
    setRequestLoading(true);
    try {
      const res = await fetch(`/api/rides/${ride.id}/request`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUserRequestStatus(data.status);
      }
    } catch (err) {
      console.error('Error sending chat request:', err);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleResponseRequest = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setRequestLoading(true);
    try {
      const res = await fetch(`/api/rides/requests/${requestId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchRequestStatus();
      }
    } catch (err) {
      console.error('Error responding to request:', err);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageContent = inputText;
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch(`/api/rides/${ride.id}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageContent }),
      });

      if (res.ok) {
        await fetchMessages();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const isChatUnlocked = isDriver || userRequestStatus === 'ACCEPTED';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white shadow-2xl border-l border-gray-100 flex flex-col h-full animate-slide-in">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={ride.driverAvatar}
              alt={ride.driverName}
              className="h-10 w-10 rounded-full object-cover border border-brand-blue/10"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#5cfd80] border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900 flex items-center space-x-1">
              <span>{ride.driverName}</span>
              <ShieldCheck className="h-3.5 w-3.5 text-brand-green" title="Verified Member" />
            </h4>
            <div className="flex items-center text-xs text-gray-400 font-semibold mt-0.5">
              <Star className="h-3 w-3 fill-current text-amber-500 mr-0.5" />
              <span>{ride.driverRating.toFixed(1)} Rating • {ride.carModel}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Driver Request Manager View */}
      {isDriver && driverRequests.length > 0 && (
        <div className="bg-blue-50/70 border-b border-blue-100 p-3 space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-brand-blue flex items-center justify-between">
            <span>Co-traveler Chat Requests ({driverRequests.length})</span>
          </p>
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {driverRequests.map((req) => (
              <div key={req.id} className="bg-white p-2.5 rounded-xl border border-blue-100 flex items-center justify-between shadow-2xs">
                <div>
                  <p className="text-xs font-bold text-gray-900">{req.requesterName}</p>
                  <p className="text-[10px] font-semibold text-gray-500">Status: <span className="uppercase text-brand-blue">{req.status}</span></p>
                </div>
                {req.status === 'PENDING' ? (
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleResponseRequest(req.id, 'ACCEPTED')}
                      disabled={requestLoading}
                      className="px-2.5 py-1 bg-brand-green hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleResponseRequest(req.id, 'REJECTED')}
                      disabled={requestLoading}
                      className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {req.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-driver Request Status Banners */}
      {!isDriver && (
        <>
          {userRequestStatus === null && (
            <div className="bg-blue-50 border-b border-blue-100 p-4 space-y-2 text-center">
              <div className="flex items-center justify-center space-x-1.5 text-xs font-extrabold text-brand-blue">
                <Lock className="h-4 w-4" />
                <span>Chat Request Required</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">
                To protect privacy, send a chat request to the driver before starting a conversation.
              </p>
              <button
                onClick={handleSendRequest}
                disabled={requestLoading}
                className="mt-1 inline-flex items-center space-x-1.5 bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <SendHorizontal className="h-3.5 w-3.5" />
                <span>{requestLoading ? 'Sending Request...' : 'Send Chat Request to Driver'}</span>
              </button>
            </div>
          )}

          {userRequestStatus === 'PENDING' && (
            <div className="bg-amber-50 border-b border-amber-200 p-3.5 flex items-center space-x-3">
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">Request Pending Driver Acceptance</p>
                <p className="text-[11px] font-semibold text-amber-700">
                  Your chat request was sent. The messaging terminal will unlock as soon as the driver accepts.
                </p>
              </div>
            </div>
          )}

          {userRequestStatus === 'REJECTED' && (
            <div className="bg-red-50 border-b border-red-200 p-3.5 flex items-center space-x-3">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-red-900">Chat Request Declined</p>
                <p className="text-[11px] font-semibold text-red-700">
                  The driver was unable to accept your chat request for this trip.
                </p>
              </div>
            </div>
          )}

          {userRequestStatus === 'ACCEPTED' && (
            <div className="bg-emerald-50 border-b border-emerald-200 p-2.5 flex items-center space-x-2 text-xs font-extrabold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Chat Request Accepted! Direct messaging active.</span>
            </div>
          )}
        </>
      )}

      {/* Security notice */}
      <div className="bg-[#fef3c7]/30 border-b border-[#fde68a]/40 px-4 py-2 flex items-center space-x-1.5 text-[10px] text-brand-gold font-bold">
        <span>🔒</span>
        <span>End-to-End Encrypted Secure Channel. Your location is confidential.</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50">
        {messages.map((msg) => {
          const isMyOwnMessage = (isDriver && msg.sender === 'driver') || (!isDriver && msg.sender === 'user');
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMyOwnMessage ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-medium shadow-sm leading-relaxed ${
                  isMyOwnMessage
                    ? 'bg-brand-blue text-white rounded-tr-none'
                    : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-gray-400 mt-1 px-1 font-semibold">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSendMessage} className="p-3.5 border-t border-gray-100 bg-white flex items-center space-x-2">
        <input
          type="text"
          placeholder={isChatUnlocked ? "Message co-traveler..." : "Unlock chat by accepting / sending request..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={!isChatUnlocked || loading}
          className="flex-1 h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-blue focus:bg-white transition-all text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!isChatUnlocked || !inputText.trim() || loading}
          className="h-11 w-11 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl flex items-center justify-center transition-colors disabled:bg-gray-200 disabled:text-gray-400 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
