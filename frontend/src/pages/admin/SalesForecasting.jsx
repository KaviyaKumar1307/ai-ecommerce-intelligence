import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, AlertCircle, Info, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const SalesForecasting = () => {
  const [forecast, setForecast] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const [forecastRes, salesRes] = await Promise.all([
        api.get('/ai/forecast'),
        api.get('/admin/sales-history')
      ]);

      if (forecastRes.data.success) {
        setForecast(forecastRes.data.data);
      }
      if (salesRes.data.success) {
        setHistory(salesRes.data.data.slice(-30));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load forecast data. Ensure AI service is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForecast(); }, []);

  const allSales = [
    ...history.map(d => ({ date: d.date, value: parseFloat(d.total_sales || 0), type: 'historical' })),
    ...(forecast?.predictions || []).map(d => ({ date: d.date, value: parseFloat(d.predicted_sales || 0), type: 'forecast' }))
  ];
  const maxVal = Math.max(...allSales.map(d => d.value), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Forecasting</h1>
          <p className="text-xs text-slate-500 mt-1">
            ML-powered time-series prediction using Linear Regression on 182-day historical data
          </p>
        </div>
        <button
          onClick={fetchForecast}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Regenerate Forecast</span>
        </button>
      </div>

      {/* AI Method Info */}
      <div className="flex items-start space-x-3 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900">
        <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">ML Algorithm:</span> Scikit-learn Linear Regression trained on 182 days of daily sales
          aggregates. The model learns seasonality + trend patterns and projects the next 30 days. RMSE and R² metrics
          are included for model evaluation.
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="flex items-start space-x-3 p-5 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Forecast Unavailable</p>
            <p className="text-xs">{error}</p>
            <p className="text-xs mt-2 text-rose-600">
              The Python AI service must be running on port 8000. Start it with: <code className="font-mono bg-rose-100 px-1 rounded">python main.py</code> inside the <code className="font-mono bg-rose-100 px-1 rounded">ai-service/</code> directory.
            </p>
          </div>
        </div>
      )}

      {forecast && !loading && (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Model Accuracy (R²)</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                {forecast.model_metrics?.r2_score ? `${(forecast.model_metrics.r2_score * 100).toFixed(1)}%` : 'N/A'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Coefficient of Determination</p>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">RMSE</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                ₹{forecast.model_metrics?.rmse ? parseFloat(forecast.model_metrics.rmse).toFixed(0) : 'N/A'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Root Mean Squared Error</p>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">30-Day Projected Revenue</p>
              <p className="text-3xl font-extrabold text-indigo-600 mt-1">
                ₹{forecast.predictions
                  ? forecast.predictions.reduce((s, d) => s + parseFloat(d.predicted_sales || 0), 0).toLocaleString('en-IN')
                  : 'N/A'
                }
              </p>
              <p className="text-xs text-slate-500 mt-1">Summed forecast over 30 days</p>
            </div>
          </div>

          {/* Combined Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Historical + 30-Day Forecast</h3>
                <p className="text-[11px] text-slate-500">Blue = historical data · Purple = ML predictions</p>
              </div>
              <div className="flex items-center space-x-4 text-xs">
                <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block"></span><span className="text-slate-600">Historical</span></span>
                <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-sm bg-purple-500 inline-block"></span><span className="text-slate-600">Forecast</span></span>
              </div>
            </div>

            <div className="h-56 flex items-end gap-0.5 pt-6 pb-2 border-b border-slate-100 overflow-x-auto">
              {allSales.slice(-45).map((d, idx) => {
                const heightPct = Math.max(8, Math.round((d.value / maxVal) * 100));
                return (
                  <div key={idx} className="flex-1 min-w-[8px] flex flex-col items-center gap-0.5 group relative">
                    <div
                      className="absolute -top-10 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
                    >
                      {d.date}: ₹{d.value.toLocaleString('en-IN')}
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t transition-all ${
                        d.type === 'forecast'
                          ? 'bg-gradient-to-t from-purple-600 to-pink-500 opacity-80'
                          : 'bg-gradient-to-t from-indigo-600 to-blue-400'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prediction Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">30-Day Prediction Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-slate-500 font-bold uppercase tracking-wider pb-3 pr-4">#</th>
                    <th className="text-left text-slate-500 font-bold uppercase tracking-wider pb-3 pr-4">Date</th>
                    <th className="text-right text-slate-500 font-bold uppercase tracking-wider pb-3">Predicted Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(forecast.predictions || []).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 pr-4 text-slate-400 font-mono">{i + 1}</td>
                      <td className="py-2.5 pr-4 text-slate-700 font-medium">{row.date}</td>
                      <td className="py-2.5 text-right font-bold text-indigo-700">
                        ₹{parseFloat(row.predicted_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesForecasting;
