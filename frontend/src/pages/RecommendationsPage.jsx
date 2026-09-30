import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Cpu, Activity, BarChart2, ShieldCheck, RefreshCw } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

const RecommendationsPage = () => {
  const { user } = useAuth();
  const [strategy, setStrategy] = useState('HYBRID');
  const [recommendations, setRecommendations] = useState([]);
  const [algorithmDetails, setAlgorithmDetails] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ai/recommend?strategy=${strategy}&limit=12`);
      if (res.data.success) {
        setRecommendations(res.data.recommendations || []);
        setAlgorithmDetails(res.data.algorithm_details || '');
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [strategy, user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-8 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-indigo-200 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Explainable Recommendation System</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          AI Recommendations Engine
        </h1>

        <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
          Unlike black-box algorithms, our hybrid recommendation engine combines TF-IDF attribute vectors,
          historical user behavioral weights (views, cart adds, purchases), and bayesian popularity scores.
        </p>

        {/* Strategy Switcher Pills */}
        <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
          <button
            onClick={() => setStrategy('HYBRID')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              strategy === 'HYBRID'
                ? 'bg-white text-indigo-900 shadow-md font-bold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Brain className="w-4 h-4 text-purple-400" />
            <span>Hybrid Personalized</span>
          </button>

          <button
            onClick={() => setStrategy('COLD_START_POPULARITY')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              strategy === 'COLD_START_POPULARITY'
                ? 'bg-white text-indigo-900 shadow-md font-bold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>Popular & Top-Rated</span>
          </button>
        </div>
      </div>

      {/* Mathematical Breakdown Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          <span>Active Algorithm Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">1. Content Similarity (50%)</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              TF-IDF vector space model comparing catalog specs, category keywords, and user interest vector.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">2. Behavioral Signals (30%)</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Weighted user event stream: Purchases (1.0), Cart adds (0.6), Views (0.2).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">3. Popularity & Quality (20%)</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Normalized star rating, verified review count, and featured product bonus.
            </p>
          </div>
        </div>

        <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 font-mono text-[11px] text-indigo-900">
          Formula: <span className="font-bold">score = 0.5 * cos(U, P) + 0.3 * Behavior(P) + 0.2 * Popularity(P)</span>
        </div>
      </div>

      {/* Recommended Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
              <div className="aspect-[4/3] bg-slate-200 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recommendations.map((product) => (
            <ProductCard key={product.id} product={product} showAIBadge={true} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <p className="text-slate-600 text-xs">No recommendations available for the selected criteria.</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
