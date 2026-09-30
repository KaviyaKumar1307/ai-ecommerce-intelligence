import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ShieldCheck, Database, GitBranch, Terminal, Sparkles, BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                AURA COMMERCE
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs pr-6">
              A production-style, full-stack AI-Powered E-Commerce Intelligence System built from scratch.
              Integrates real-time relational data flow with a decoupled Python FastAPI machine learning subsystem
              for semantic search, hybrid recommendations, conversational assistance, sales forecasting, and behavioral customer segmentation.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700">React 18</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700">Node.js Express</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700">FastAPI</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700">Scikit-Learn</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700">MySQL / Sequelize</span>
            </div>
          </div>

          {/* AI Capabilities */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Architecture</span>
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/products?semantic=true" className="hover:text-indigo-400 transition-colors">
                  Semantic Search (TF-IDF)
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-indigo-400 transition-colors">
                  Hybrid Recommendations
                </Link>
              </li>
              <li>
                <span className="text-slate-500">NLP Shopping Assistant</span>
              </li>
              <li>
                <Link to="/admin" className="hover:text-indigo-400 transition-colors">
                  Random Forest Forecasting
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-indigo-400 transition-colors">
                  K-Means Customer Segments
                </Link>
              </li>
            </ul>
          </div>

          {/* E-Commerce Navigation */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Explore Store
            </h4>
            <ul className="space-y-2.5">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products (52)</Link></li>
              <li><Link to="/products?category=1" className="hover:text-white transition-colors">Laptops & Workstations</Link></li>
              <li><Link to="/products?category=2" className="hover:text-white transition-colors">Audio & Headphones</Link></li>
              <li><Link to="/products?category=4" className="hover:text-white transition-colors">Marathon & Fitness</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
            </ul>
          </div>

          {/* Developer / Interview Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Technical Review</span>
            </h4>
            <ul className="space-y-2.5">
              <li><Link to="/admin" className="text-purple-400 hover:text-purple-300 font-semibold">Admin Intelligence Panel</Link></li>
              <li><span className="text-slate-500">Swagger Docs: /docs (FastAPI)</span></li>
              <li><span className="text-slate-500">Health Endpoint: /health</span></li>
              <li><span className="text-slate-500">Relational DB: 12 Tables</span></li>
              <li><span className="text-slate-500">Dataset: 182-Day Daily Sales</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>
            &copy; 2026 AURA Commerce. All systems operational. Designed for Computer Science Capstone & Technical Interviews.
          </div>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <span className="flex items-center space-x-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Fake AI Policy</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>JWT Protected</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
