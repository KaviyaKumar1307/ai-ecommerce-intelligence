import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, ArrowRight, CreditCard, Banknote, QrCode } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const CheckoutPage = () => {
  const { items, subtotal, totalItems, refreshCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    street: '42 Tech Park Avenue, Residency Road',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560001',
    phone: '+91 98765 43210'
  });

  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
        <Link to="/products" className="text-xs font-semibold text-indigo-600 hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const shipping = subtotal > 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + shipping + tax;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fullAddressString = `${address.fullName}, ${address.street}, ${address.city}, ${address.state} - ${address.postalCode}. Tel: ${address.phone}`;
      const res = await api.post('/orders', {
        shipping_address: fullAddressString,
        payment_method: paymentMethod
      });

      if (res.data.success) {
        setCompletedOrder(res.data.data.order);
        await refreshCart();
        addToast('Order successfully confirmed and placed!', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Confirmed!</h1>
          <p className="text-xs text-slate-500">
            Thank you for shopping with AURA Commerce. Your order has been recorded into the live database.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 text-left space-y-4 shadow-sm text-xs">
          <div className="flex justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-500">Order ID:</span>
            <span className="font-mono font-bold text-slate-900">#{completedOrder.id}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-500">Total Paid:</span>
            <span className="font-bold text-indigo-600 text-sm">₹{parseFloat(completedOrder.total_amount).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-500">Status:</span>
            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase">
              {completedOrder.status}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Delivering To:</span>
            <p className="text-slate-700 font-medium">{completedOrder.shipping_address}</p>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 pt-2">
          <Link
            to="/orders"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-md"
          >
            View Order History
          </Link>
          <Link
            to="/products"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-6 py-3 rounded-2xl"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">Confirm your shipping address and payment method</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Shipping & Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              1. Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Full Recipient Name</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">State</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              2. Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                  className="hidden"
                />
                <CreditCard className="w-5 h-5 text-indigo-600 mb-2" />
                <span className="font-bold text-xs">Credit / Debit Card</span>
                <span className="text-[10px] text-slate-500 mt-1">Visa, Mastercard, Rupay</span>
              </label>

              <label
                className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="hidden"
                />
                <QrCode className="w-5 h-5 text-indigo-600 mb-2" />
                <span className="font-bold text-xs">Instant UPI</span>
                <span className="text-[10px] text-slate-500 mt-1">Google Pay, PhonePe, Paytm</span>
              </label>

              <label
                className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="hidden"
                />
                <Banknote className="w-5 h-5 text-indigo-600 mb-2" />
                <span className="font-bold text-xs">Cash on Delivery</span>
                <span className="text-[10px] text-slate-500 mt-1">Pay upon product arrival</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            Order Review
          </h3>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-2 truncate pr-2">
                  <span className="text-slate-400 font-mono">x{item.quantity}</span>
                  <span className="truncate text-slate-800 font-medium">{item.product?.name}</span>
                </div>
                <span className="font-semibold text-slate-900 flex-shrink-0">
                  ₹{(parseFloat(item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 text-xs pt-4 border-t border-slate-100">
            <div className="flex justify-between text-slate-600">
              <span>Items Total ({totalItems})</span>
              <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-semibold text-emerald-600">
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (18%)</span>
              <span className="font-semibold text-slate-900">₹{tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Grand Total</span>
              <span className="text-lg text-indigo-600">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <span>Verifying Inventory & Placing Order...</span>
            ) : (
              <>
                <span>Place Order & Pay ₹{grandTotal.toLocaleString('en-IN')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
