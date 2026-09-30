import React, { useState, useEffect } from 'react';
import { PieChart, Users, Sparkles, CheckCircle2, TrendingUp, Layers, HelpCircle } from 'lucide-react';
import api from '../../services/api';

const CustomerSegmentation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/ai/segments');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load customer segments:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSegments();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { algorithm, k_clusters, silhouette_score, features_used, segments } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 border border-purple-900/40 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 bg-purple-500/20 border border-purple-400/30 px-3 py-1 rounded-full text-purple-300 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Unsupervised Machine Learning</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight">
          Customer Behavioral Segmentation
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Customer personas are algorithmically discovered using <strong>K-Means Clustering</strong> on normalized
          RFM vectors (Total Spending, Order Count, Average Order Value, Recency) combined with on-site engagement signals (Product Views and Cart Activity).
        </p>

        {/* Validation Score Ribbon */}
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
          <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15">
            <span className="text-slate-400">Clustering Algorithm: </span>
            <span className="font-bold text-white">{algorithm}</span>
          </div>
          <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15">
            <span className="text-slate-400">Total Clusters: </span>
            <span className="font-bold text-purple-300">k = {k_clusters}</span>
          </div>
          <div className="bg-emerald-500/20 px-3.5 py-1.5 rounded-xl border border-emerald-400/30 text-emerald-300 font-mono">
            <span>Silhouette Coefficient: </span>
            <span className="font-bold">{silhouette_score} (Strong Cohesion)</span>
          </div>
        </div>
      </div>

      {/* Feature Engineering Explainer */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Standardized Feature Vectors Used in K-Means</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {features_used?.map((f, i) => (
            <span key={i} className="bg-slate-100 text-slate-700 font-mono px-3 py-1 rounded-lg border border-slate-200">
              {f}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">
          Features are standardized via Z-score transformation (z = [x - μ] / σ) prior to Euclidean distance minimization to prevent higher monetary figures from dominating browsing signals.
        </p>
      </div>

      {/* Clusters Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map((seg) => (
          <div
            key={seg.cluster_id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-lg hover:border-purple-200 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  Segment #{seg.cluster_id + 1}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {seg.customer_count} Customers
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 leading-snug">
                {seg.name}
              </h3>

              {/* Characteristics Summary */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                {seg.characteristics}
              </div>

              {/* Cluster Centroid Means */}
              <div className="space-y-2 text-xs pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Centroid Averages</span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Avg Spend:</span>
                  <span className="font-bold text-slate-900">₹{parseFloat(seg.metrics?.avg_total_spending || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Avg Orders:</span>
                  <span className="font-bold text-slate-900">{seg.metrics?.avg_orders}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Avg Views:</span>
                  <span className="font-bold text-slate-900">{seg.metrics?.avg_product_views} views</span>
                </div>
              </div>
            </div>

            {/* Customers list inside this cluster */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sample Members</span>
              <div className="space-y-1 text-xs">
                {seg.customers?.map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-slate-600">
                    <span className="font-medium truncate pr-2">{c.name}</span>
                    <span className="font-mono text-slate-800 font-bold">₹{parseFloat(c.total_spending || 0).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerSegmentation;
