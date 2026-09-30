import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Sparkles,
  User,
  ShieldCheck,
  LogOut,
  Package,
  Layers,
  Compass,
  Cpu,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AssistantModal from './AssistantModal';

const Navbar = () => {
  const { user, isAdmin, logout, quickLogin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSemantic, setIsSemantic] = useState(true);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}&semantic=${isSemantic}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        {/* Top Demo Bar / Quick Role Switcher */}
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-200">AI Intelligence Engine Online</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline text-[11px]">TF-IDF Vector Space &bull; K-Means RFM &bull; Random Forest Forecaster</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            {!user ? (
              <>
                <span className="text-slate-400">Quick Test Login:</span>
                <button
                  onClick={() => quickLogin('CUSTOMER')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline"
                >
                  Customer Demo
                </button>
                <span className="text-slate-600">&bull;</span>
                <button
                  onClick={() => quickLogin('ADMIN')}
                  className="text-purple-400 hover:text-purple-300 font-medium underline"
                >
                  Admin Demo
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Signed in as</span>
                <span className="text-white font-semibold">{user.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${isAdmin ? 'bg-purple-600 text-white' : 'bg-indigo-600 text-white'}`}>
                  {user.role}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform duration-300">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                      AURA
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                      AI 2.0
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase block -mt-1">
                    Commerce Intelligence
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center space-x-1">
                <Link
                  to="/products"
                  className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  Shop Catalog
                </Link>
                <Link
                  to="/recommendations"
                  className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>AI Recommendations</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Central Search Bar with AI Semantic Toggle */}
            <div className="hidden md:flex flex-1 max-w-lg mx-6">
              <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isSemantic
                        ? "Search semantically (e.g. 'marathon running shoes', 'workstation for code')..."
                        : "Search keyword in products, brands, specs..."
                    }
                    className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs pl-10 pr-28 py-2.5 rounded-2xl border border-transparent focus:border-indigo-400 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                  {/* Semantic Search Mode Switcher Pill */}
                  <button
                    type="button"
                    onClick={() => setIsSemantic(!isSemantic)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-1 rounded-lg border transition-all flex items-center space-x-1 ${
                      isSemantic
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                    title="Toggle between AI Semantic Search (NLP Concept Matching) and SQL Keyword Search"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{isSemantic ? 'Semantic' : 'Keyword'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-3">
              {/* AI Assistant Quick Trigger */}
              <button
                onClick={() => setIsAssistantOpen(true)}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                <span>AI Assistant</span>
              </button>

              {/* Cart Icon */}
              <Link
                to="/cart"
                className="relative p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-2xl transition-colors"
                title="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User Account Dropdown */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 pl-2.5 pr-2 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all"
                  >
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[80px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-2xl transition-colors"
                  >
                    Sign In
                  </Link>
                )}

                {/* Dropdown Menu */}
                {isUserMenuOpen && user && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-scale-in"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>Order History</span>
                    </Link>

                    <Link
                      to="/recommendations"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span>My Recommendations</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-indigo-600 rounded-xl"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products semantically..."
                className="w-full bg-slate-100 text-xs pl-9 pr-24 py-2 rounded-xl border border-transparent focus:border-indigo-400"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setIsSemantic(!isSemantic)}
                className="absolute right-2 top-1.5 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold"
              >
                {isSemantic ? 'AI' : 'SQL'}
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* AI Assistant Chat Modal */}
      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </>
  );
};

export default Navbar;
