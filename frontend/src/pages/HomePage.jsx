import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Zap,
  ShoppingBag,
  Layers,
  ChevronRight,
  Star,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import AssistantModal from '../components/AssistantModal';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recommendationStrategy, setRecommendationStrategy] = useState('HYBRID');
  const [loading, setLoading] = useState(true);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        // Load categories
        const catRes = await api.get('/categories');
        if (catRes.data.success) {
          setCategories(catRes.data.data.categories || []);
        }

        // Load featured products
        const featRes = await api.get('/products?featured=true&limit=8');
        if (featRes.data.success) {
          setFeaturedProducts(featRes.data.data.products || []);
        }

        // Load personalized recommendations from AI endpoint
        const recRes = await api.get(`/ai/recommend?strategy=${recommendationStrategy}&limit=4`);
        if (recRes.data.success) {
          setRecommendedProducts(recRes.data.recommendations || []);
        }
      } catch (err) {
        console.warn('[HomePage] Failed to fetch home data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [recommendationStrategy]);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Section with AI Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white py-20 px-4 sm:px-8 rounded-b-[40px] shadow-2xl border-b border-indigo-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_50%)]"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1.5 rounded-full text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>AI-Powered E-Commerce Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Next-Gen Store. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                Driven by Real AI & Machine Learning.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed font-normal">
              Experience intelligent shopping powered by a dedicated Python FastAPI service:
              TF-IDF Semantic Search, Hybrid Personalization, NLP Shopping Assistant,
              and Random Forest Sales Forecasting.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/products"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-7 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center space-x-2"
              >
                <span>Browse 52+ Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setIsAssistantOpen(true)}
                className="bg-white/10 hover:bg-white/15 text-white font-semibold text-sm px-6 py-3.5 rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ask AI Shopping Assistant</span>
              </button>
            </div>

            {/* Proof Points */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs">
              <div>
                <span className="text-xl sm:text-2xl font-bold text-white block">52+</span>
                <span className="text-slate-400">Curated Tech Products</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-indigo-400 block">5 ML</span>
                <span className="text-slate-400">Integrated AI Modules</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-emerald-400 block">182 Days</span>
                <span className="text-slate-400">Historical Sales Model</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-slate-900/80 rounded-3xl p-6 border border-slate-700/60 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-xs text-white">Live AI Inference Engine</span>
                </div>
                <span className="flex items-center space-x-1 text-[11px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>FastAPI Online</span>
                </span>
              </div>

              {/* Sample AI Query Simulation Card */}
              <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/40 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Natural Language Prompt</span>
                <p className="text-xs text-indigo-200 font-medium italic">
                  "I need a laptop for programming under ₹70,000"
                </p>
                <div className="flex items-center space-x-2 text-[11px] text-emerald-300 pt-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Parsed: max_price=70000, category=laptops, intent=coding</span>
                </div>
              </div>

              <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hybrid Scoring Formula</span>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">Explainable AI</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-indigo-300 border border-slate-800">
                  score = 0.5*Content + 0.3*Behavioral + 0.2*Popularity
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/admin"
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md"
                >
                  <span>Open Admin Intelligence Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Product Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Explore Categories</h2>
            <p className="text-xs text-slate-500 mt-1">Browse high performance gear indexed across 5 distinct domains</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all p-4 flex flex-col items-center text-center space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {cat.product_count || 10} Products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. AI Recommendations Showcase (Real API Data Flow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50 rounded-3xl p-6 sm:p-8 border border-indigo-100/90 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Personalized Intelligence Engine</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recommended For You</h2>
              <p className="text-xs text-slate-500 mt-1">
                Generated via TF-IDF content representations and behavioral interaction weighting.
              </p>
            </div>

            {/* Algorithm Switcher Tabs */}
            <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs text-xs font-semibold">
              <button
                onClick={() => setRecommendationStrategy('HYBRID')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  recommendationStrategy === 'HYBRID'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                Hybrid (Explainable)
              </button>
              <button
                onClick={() => setRecommendationStrategy('COLD_START_POPULARITY')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  recommendationStrategy === 'COLD_START_POPULARITY'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                Top Popular
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} showAIBadge={true} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/recommendations"
              className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 px-5 py-2.5 rounded-xl transition-all shadow-xs"
            >
              <span>Explore Complete AI Recommendation Breakdown</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Featured Flagships */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Featured Products</h2>
            <p className="text-xs text-slate-500 mt-1">High-end developer workstations, pro audio gear, and performance apparel</p>
          </div>
          <Link to="/products?featured=true" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
            <span>View All Featured</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} showAIBadge={false} />
          ))}
        </div>
      </section>

      {/* 5. AI Assistant Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-indigo-800">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Interactive Conversational Assistant</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold">
              Can't decide? Let our AI assistant find your exact match.
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Type naturally like "I need running shoes under ₹15,000 for marathon training" or "A lightweight laptop for coding with 16GB RAM".
              Our rule-based NLP entity extractor processes constraints and returns real, stocked catalog items with justifications.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsAssistantOpen(true)}
                className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs px-6 py-3 rounded-2xl shadow-lg transition-all flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Launch Shopping Assistant</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Assistant Modal */}
      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </div>
  );
};

export default HomePage;
