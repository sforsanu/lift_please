import React, { useState, useEffect, useRef } from 'react';
import { Message, Ride } from '../types';
import { X, Send, ShieldCheck, Star } from 'lucide-react';

interface ChatDrawerProps {
  ride: Ride;
  onClose: () => void;
}

export default function ChatDrawer({ ride, onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages initially and set up polling interval (every 2 seconds) to receive simulated driver replies
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/rides/${ride.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [ride.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageContent = inputText;
    setInputText('');
    setLoading(true);

    try {
      // POST message to server API
      const res = await fetch(`/api/rides/${ride.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: 'user',
          text: messageContent,
        }),
      });

      if (res.ok) {
        await fetchMessages(); // Immediate refresh
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Security notice */}
      <div className="bg-[#fef3c7]/30 border-b border-[#fde68a]/40 px-4 py-2 flex items-center space-x-1.5 text-[10px] text-brand-gold font-bold">
        <span>🔒</span>
        <span>End-to-End Encrypted Secure Channel. Your location is confidential.</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-medium shadow-sm leading-relaxed ${
                  isUser
                    ? 'bg-brand-blue text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
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
          placeholder="Message co-traveler..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          className="flex-1 h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-blue focus:bg-white transition-all text-gray-800 placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="h-11 w-11 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl flex items-center justify-center transition-colors disabled:bg-gray-200 disabled:text-gray-400 active:scale-95 cursor-pointer"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
