import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';

// ── Eagerly-loaded public pages ─────────────────────────────────────
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// ── Lazy-loaded pages for code-splitting ────────────────────────────
const ProductsPage          = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage     = lazy(() => import('./pages/ProductDetailPage'));
const CartPage              = lazy(() => import('./pages/CartPage'));
const CheckoutPage          = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage            = lazy(() => import('./pages/OrdersPage'));
const RecommendationsPage   = lazy(() => import('./pages/RecommendationsPage'));

// ── Admin pages ──────────────────────────────────────────────────────
const AdminLayout           = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard        = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductManagement     = lazy(() => import('./pages/admin/ProductManagement'));
const OrderManagement       = lazy(() => import('./pages/admin/OrderManagement'));
const UserManagement        = lazy(() => import('./pages/admin/UserManagement'));
const CustomerSegmentation  = lazy(() => import('./pages/admin/CustomerSegmentation'));
const SalesForecasting      = lazy(() => import('./pages/admin/SalesForecasting'));
const AIMonitoring          = lazy(() => import('./pages/admin/AIMonitoring'));

// ── Full-screen loading spinner ──────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 border-4 border-indigo-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-semibold text-slate-500 tracking-wide">Loading AURA…</p>
    </div>
  </div>
);

// ── Protected route guard ────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
};

// ── Storefront layout (Navbar + content + Footer) ────────────────────
const StorefrontLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// ── Root app with all providers ──────────────────────────────────────
const AppRoutes = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ─── Public Storefront ─── */}
        <Route path="/" element={<StorefrontLayout><HomePage /></StorefrontLayout>} />
        <Route path="/login" element={<StorefrontLayout><LoginPage /></StorefrontLayout>} />
        <Route path="/register" element={<StorefrontLayout><RegisterPage /></StorefrontLayout>} />
        <Route path="/products" element={<StorefrontLayout><ProductsPage /></StorefrontLayout>} />
        <Route path="/products/:id" element={<StorefrontLayout><ProductDetailPage /></StorefrontLayout>} />

        {/* ─── Protected Customer Routes ─── */}
        <Route path="/cart" element={<StorefrontLayout><ProtectedRoute><CartPage /></ProtectedRoute></StorefrontLayout>} />
        <Route path="/checkout" element={<StorefrontLayout><ProtectedRoute><CheckoutPage /></ProtectedRoute></StorefrontLayout>} />
        <Route path="/orders" element={<StorefrontLayout><ProtectedRoute><OrdersPage /></ProtectedRoute></StorefrontLayout>} />
        <Route path="/recommendations" element={<StorefrontLayout><ProtectedRoute><RecommendationsPage /></ProtectedRoute></StorefrontLayout>} />

        {/* ─── Admin Panel ─── */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="segmentation" element={<CustomerSegmentation />} />
          <Route path="forecasting" element={<SalesForecasting />} />
          <Route path="monitoring" element={<AIMonitoring />} />
        </Route>

        {/* ─── Catch-all ─── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

const App = () => (
  <NotificationProvider>
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  </NotificationProvider>
);

export default App;
