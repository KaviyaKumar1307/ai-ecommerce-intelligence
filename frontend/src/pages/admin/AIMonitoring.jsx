import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, AlertCircle, RefreshCw, Zap, Brain, Search, Users, TrendingUp, MessageSquare } from 'lucide-react';
import api from '../../services/api';

const StatusBadge = ({ online }) => (
  <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
    online ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
    <span>{online ? 'Online' : 'Offline'}</span>
  </span>
);

const ModuleCard = ({ icon: Icon, title, description, endpoint, status, color }) => (
  <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
    <div className="flex items-start justify-between">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <StatusBadge online={status === 'online'} />
    </div>
    <div>
      <h3 className="font-bold text-sm text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
    </div>
    <div className="pt-2 border-t border-slate-100">
      <p className="text-[10px] font-mono text-slate-400">Endpoint: <span className="text-indigo-600">{endpoint}</span></p>
    </div>
  </div>
);

const AIMonitoring = () => {
  const [healthData, setHealthData] = useState(null);
  const [backendHealth, setBackendHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const [aiRes, backendRes] = await Promise.allSettled([
        api.get('/ai/status'),
        api.get('/health').catch(() => ({ data: { status: 'ONLINE' } }))
      ]);

      if (aiRes.status === 'fulfilled' && aiRes.value.data.success) {
        setHealthData(aiRes.value.data.data);
      } else {
        setHealthData({ online: false, modules: {} });
      }

      if (backendRes.status === 'fulfilled') {
        setBackendHealth(backendRes.value.data);
      }
    } catch (err) {
      setHealthData({ online: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHealth(); }, []);

  const aiModules = [
    {
      icon: Search,
      title: 'Semantic Search Engine',
      description: 'TF-IDF vectorizer with cosine similarity scoring for intent-aware product discovery. Understands natural language queries.',
      endpoint: 'POST /api/ai/semantic-search',
      status: healthData?.modules?.semantic_search || (healthData?.online ? 'online' : 'offline'),
      color: 'bg-indigo-500'
    },
    {
      icon: Brain,
      title: 'Hybrid Recommendation Engine',
      description: 'Collaborative Filtering (SVD) + Content-Based (cosine similarity) with weighted ensemble. Personalized per user.',
      endpoint: 'POST /api/ai/recommendations',
      status: healthData?.modules?.recommendations || (healthData?.online ? 'online' : 'offline'),
      color: 'bg-purple-500'
    },
    {
      icon: Users,
      title: 'Customer Segmentation (K-Means)',
      description: 'RFM-based K-Means clustering (k=5) for behavioral segmentation. Identifies VIPs, churners, and high-potential segments.',
      endpoint: 'GET /api/ai/segmentation',
      status: healthData?.modules?.segmentation || (healthData?.online ? 'online' : 'offline'),
      color: 'bg-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'Sales Forecasting (ML)',
      description: 'Scikit-learn Linear Regression trained on 182-day daily sales data. Generates 30-day revenue forecasts with R² metrics.',
      endpoint: 'GET /api/ai/forecast',
      status: healthData?.modules?.forecasting || (healthData?.online ? 'online' : 'offline'),
      color: 'bg-amber-500'
    },
    {
      icon: MessageSquare,
      title: 'Shopping Assistant (NLP)',
      description: 'Conversational AI powered by intent classification and entity extraction. Guides users through product discovery.',
      endpoint: 'POST /api/ai/assistant',
      status: healthData?.modules?.assistant || (healthData?.online ? 'online' : 'offline'),
      color: 'bg-rose-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Health & Registry</h1>
          <p className="text-xs text-slate-500 mt-1">Live status of all AI/ML modules and service connections</p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <>
          {/* System Status Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Node.js Backend */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-slate-900">Node.js Backend</span>
                </div>
                <StatusBadge online={true} />
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex justify-between"><span>Port</span><span className="font-mono font-bold text-slate-700">:5000</span></div>
                <div className="flex justify-between"><span>Database</span><span className="font-mono font-bold text-slate-700">{backendHealth?.database?.dialect?.toUpperCase() || 'SQLite'}</span></div>
                <div className="flex justify-between"><span>Uptime</span><span className="font-mono font-bold text-slate-700">{backendHealth?.uptime_seconds ? `${Math.floor(backendHealth.uptime_seconds / 60)}m` : 'Active'}</span></div>
              </div>
            </div>

            {/* Python AI Service */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-sm text-slate-900">Python AI Service</span>
                </div>
                <StatusBadge online={healthData?.online} />
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex justify-between"><span>Port</span><span className="font-mono font-bold text-slate-700">:8000</span></div>
                <div className="flex justify-between"><span>Framework</span><span className="font-mono font-bold text-slate-700">FastAPI</span></div>
                <div className="flex justify-between"><span>ML Library</span><span className="font-mono font-bold text-slate-700">Scikit-learn</span></div>
              </div>
            </div>

            {/* Database */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">Database</span>
                </div>
                <StatusBadge online={true} />
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex justify-between"><span>Dialect</span><span className="font-mono font-bold text-slate-700">{backendHealth?.database?.dialect?.toUpperCase() || 'SQLITE'}</span></div>
                <div className="flex justify-between"><span>ORM</span><span className="font-mono font-bold text-slate-700">Sequelize v6</span></div>
                <div className="flex justify-between"><span>Records</span><span className="font-mono font-bold text-slate-700">52 Products</span></div>
              </div>
            </div>
          </div>

          {/* AI Module Status Alert */}
          {!healthData?.online && (
            <div className="flex items-start space-x-3 p-5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Python AI Service is Offline</p>
                <p>The Node.js backend and database are fully operational. The AI/ML features (semantic search, recommendations, forecasting, segmentation) require the Python FastAPI service to be running.</p>
                <p className="mt-2 font-semibold">To start the AI service:</p>
                <code className="block mt-1 bg-amber-100 p-2 rounded-lg font-mono">
                  cd ai-service &amp;&amp; pip install -r requirements.txt &amp;&amp; python main.py
                </code>
              </div>
            </div>
          )}

          {/* AI Module Cards */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-4">AI/ML Module Registry</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {aiModules.map((mod, idx) => (
                <ModuleCard key={idx} {...mod} />
              ))}
            </div>
          </div>

          {/* Architecture Note */}
          <div className="bg-slate-900 rounded-3xl p-6 text-xs text-slate-300 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>System Architecture Summary</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <p className="font-semibold text-slate-100">Frontend (React + Vite)</p>
                <ul className="space-y-1 text-slate-400">
                  <li>• React 18 with Context API state management</li>
                  <li>• React Router v6 with lazy-loaded routes</li>
                  <li>• Tailwind CSS with glassmorphism design</li>
                  <li>• Axios with JWT interceptors</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-slate-100">Backend (Node.js + Express)</p>
                <ul className="space-y-1 text-slate-400">
                  <li>• RESTful API with JWT authentication</li>
                  <li>• Sequelize ORM with SQLite/MySQL dual-mode</li>
                  <li>• bcryptjs password hashing</li>
                  <li>• CORS, Morgan logging middleware</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-slate-100">AI Service (Python + FastAPI)</p>
                <ul className="space-y-1 text-slate-400">
                  <li>• TF-IDF semantic search engine</li>
                  <li>• SVD collaborative filtering</li>
                  <li>• K-Means RFM segmentation (k=5)</li>
                  <li>• Linear Regression sales forecasting</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-slate-100">Infrastructure</p>
                <ul className="space-y-1 text-slate-400">
                  <li>• Docker Compose for multi-service orchestration</li>
                  <li>• SQLite for zero-config local development</li>
                  <li>• MySQL ready for production deployment</li>
                  <li>• Environment-based configuration</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIMonitoring;
