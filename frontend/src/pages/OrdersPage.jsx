import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, Clock, MapPin, CreditCard, ChevronRight, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders');
        if (res.data.success) {
          setOrders(res.data.data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load orders:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Please Sign In</h2>
        <p className="text-xs text-slate-500">Sign in to your account to view your past purchases and order status.</p>
        <Link to="/login" className="inline-block bg-indigo-600 text-white text-xs font-bold px-6 py-3 rounded-2xl">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Order History</h1>
        <p className="text-xs text-slate-500 mt-1">Review past orders, delivery statuses, and invoices</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            let statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
            if (order.status === 'DELIVERED') statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            else if (order.status === 'SHIPPED') statusColor = 'bg-purple-50 text-purple-700 border-purple-200';
            else if (order.status === 'CANCELLED') statusColor = 'bg-rose-50 text-rose-700 border-rose-200';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      Order #{order.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={item.product?.image_url}
                          alt={item.product?.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/products/${item.product_id}`}
                            className="font-semibold text-slate-900 hover:text-indigo-600 block truncate max-w-md"
                          >
                            {item.product?.name}
                          </Link>
                          <span className="text-slate-400">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">
                        ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery Address & Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
                  <div className="flex items-center space-x-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{order.shipping_address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span className="uppercase font-semibold text-slate-700">{order.payment_method} &bull; {order.payment_status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500">When you place an order, it will appear here in real-time.</p>
          <Link to="/products" className="inline-block bg-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
