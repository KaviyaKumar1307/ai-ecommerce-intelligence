import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin KPIs:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { summary, topSellingProducts, categoryDistribution, recentOrders, recentDailySales, systemHealth } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time commercial KPIs, live system health, and sales analytics</p>
        </div>

        {/* Live System Health Badge */}
        <div className="flex items-center space-x-3 bg-white p-2.5 px-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700">DB: {systemHealth?.database?.dialect}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${systemHealth?.aiService?.online ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="font-semibold text-slate-700">AI Service: {systemHealth?.aiService?.online ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            ₹{summary.totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">Gross revenue from finalized orders</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {summary.totalOrders}
          </div>
          <p className="text-[11px] text-slate-500">Customer transactions executed</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Average Order (AOV)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            ₹{summary.avgOrderValue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">Average ticket size per order</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {summary.totalUsers}
          </div>
          <p className="text-[11px] text-slate-500">Profiles tracked for RFM segmentation</p>
        </div>
      </div>

      {/* 14-Day Sales Trend Visual Chart */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent 14-Day Sales Velocity</h3>
            <p className="text-[11px] text-slate-500">Aggregated historical sales volume fed directly to ML forecaster</p>
          </div>
          <Link to="/admin/forecasting" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center space-x-1">
            <span>View ML Forecast</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
          {recentDailySales?.map((day, idx) => {
            const maxSales = Math.max(...recentDailySales.map(d => parseFloat(d.total_sales || 1)));
            const heightPercent = Math.max(12, Math.round((parseFloat(day.total_sales) / maxSales) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute -top-10 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {day.date}: ₹{parseFloat(day.total_sales).toLocaleString('en-IN')}
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg group-hover:from-indigo-500 group-hover:to-purple-400 transition-all"
                ></div>
                <span className="text-[9px] text-slate-400 font-mono truncate w-full text-center">
                  {day.date.slice(8)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Top Products & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Selling Products */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Top Selling Products</h3>
          <div className="divide-y divide-slate-100">
            {topSellingProducts.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="w-5 font-mono font-bold text-slate-400">#{idx + 1}</span>
                  <img
                    src={item.product?.image_url}
                    alt={item.product?.name}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 block truncate max-w-xs">{item.product?.name}</span>
                    <span className="text-[11px] text-slate-500">{item.unitsSold} units sold</span>
                  </div>
                </div>
                <span className="font-bold text-slate-900">
                  ₹{item.totalRevenue.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Catalog Category Distribution</h3>
          <div className="space-y-3">
            {categoryDistribution.map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{c.name}</span>
                  <span className="font-bold text-slate-900">{c.count} items</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.round((c.count / 52) * 100)}%` }}
                    className="bg-indigo-600 h-full rounded-full"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
