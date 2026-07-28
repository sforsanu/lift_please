import { useState, useEffect } from 'react';
import { CarbonStats } from '../types';
import { Leaf, Award, Compass, TrendingDown } from 'lucide-react';

interface CarbonDashboardProps {
  onBackClick: () => void;
}

export default function CarbonDashboard({ onBackClick }: CarbonDashboardProps) {
  const [stats, setStats] = useState<CarbonStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/carbon-stats', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching carbon stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto"></div>
        <p className="mt-4 text-sm text-gray-500 font-semibold">Loading Sustainability metrics...</p>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-b from-[#e6fcf2]/40 to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-emerald-100 text-brand-green rounded-full animate-bounce">
            <Leaf className="h-6 w-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Lift Carbon Tracker
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base">
            Every shared ride is a vote for clean air. See how our collective community effort is reducing carbon emissions.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: CO2 Saved */}
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">CO2 Emissions Saved</p>
                <p className="text-3xl font-black text-brand-green mt-2">
                  {stats?.totalCo2SavedKg.toLocaleString()} <span className="text-sm font-bold text-gray-500">kg</span>
                </p>
              </div>
              <span className="p-2.5 bg-emerald-50 text-brand-green rounded-2xl">
                <Leaf className="h-5 w-5" />
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-4">
              Equivalent of preventing gasoline burning in commuter traffic.
            </p>
          </div>

          {/* Card 2: Trees Saved */}
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tree Absorption Eq.</p>
                <p className="text-3xl font-black text-brand-green mt-2">
                  {stats?.treesEquivalent.toLocaleString()} <span className="text-sm font-bold text-gray-500">trees</span>
                </p>
              </div>
              <span className="p-2.5 bg-emerald-50 text-brand-green rounded-2xl">
                <Award className="h-5 w-5" />
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-4">
              Annual carbon intake of fully mature redwood trees.
            </p>
          </div>

          {/* Card 3: Kilometers Shared */}
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shared Distance</p>
                <p className="text-3xl font-black text-brand-blue mt-2">
                  {stats?.totalKmShared.toLocaleString()} <span className="text-sm font-bold text-gray-500">km</span>
                </p>
              </div>
              <span className="p-2.5 bg-blue-50 text-brand-blue rounded-2xl">
                <Compass className="h-5 w-5" />
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-4">
              Cumulative road distance pooled together by neighbors.
            </p>
          </div>

          {/* Card 4: Total Trips */}
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Commutes Pooled</p>
                <p className="text-3xl font-black text-brand-blue mt-2">
                  {stats?.tripsTaken.toLocaleString()} <span className="text-sm font-bold text-gray-500">trips</span>
                </p>
              </div>
              <span className="p-2.5 bg-blue-50 text-brand-blue rounded-2xl">
                <TrendingDown className="h-5 w-5" />
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-4">
              Active matching connections built through the Lift algorithm.
            </p>
          </div>

        </div>

        {/* Action / Return to pool */}
        <div className="text-center">
          <button
            onClick={onBackClick}
            className="inline-flex items-center space-x-2 border-2 border-brand-green text-brand-green hover:bg-brand-green/5 px-8 py-3.5 rounded-full font-bold text-sm transition-colors cursor-pointer"
          >
            <span>Back to Search Pools</span>
          </button>
        </div>

      </div>
    </section>
  );
}
