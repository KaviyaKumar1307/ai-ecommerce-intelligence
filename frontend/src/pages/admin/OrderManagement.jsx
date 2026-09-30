import React, { useState, useEffect } from 'react';
import { ShoppingCart, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
      if (res.data.success) {
        setOrders(res.data.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        addToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
        fetchOrders();
      }
    } catch (err) {
      addToast('Failed to update status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Fulfillment & Logistics</h1>
        <p className="text-xs text-slate-500 mt-1">Manage transactional order flow, tracking updates, and dispatch statuses</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{o.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block">{o.user?.name || 'Customer'}</span>
                    <span className="text-[10px] text-slate-400">{o.user?.email}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-700">{o.items?.length || 1} item(s)</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{parseFloat(o.total_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 font-bold text-[11px] focus:outline-none focus:border-purple-500"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
