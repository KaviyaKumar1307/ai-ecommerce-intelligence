import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { addToast } = useNotification();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setItems(res.data.data.items || []);
      }
    } catch (err) {
      console.warn('[CartContext] Failed to load cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, productName = 'Item') => {
    if (!user) {
      addToast('Please log in to add products to your cart.', 'info');
      return { success: false, requireLogin: true };
    }

    try {
      const res = await api.post('/cart', { product_id: productId, quantity });
      if (res.data.success) {
        addToast(`Added "${productName}" to your cart!`, 'success');
        await fetchCart();
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not add to cart.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity });
      if (res.data.success) {
        await fetchCart();
      }
    } catch (err) {
      addToast('Failed to update item quantity.', 'error');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      if (res.data.success) {
        addToast('Item removed from cart.', 'info');
        await fetchCart();
      }
    } catch (err) {
      addToast('Failed to remove item.', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setItems([]);
    } catch (err) {
      console.warn('[CartContext] Failed to clear cart:', err.message);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || 0);
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        totalItems,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
