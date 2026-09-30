import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Sparkles,
  SlidersHorizontal,
  Star,
  RefreshCw,
  X,
  Check
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isSemantic, setIsSemantic] = useState(searchParams.get('semantic') === 'true');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(300000);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [semanticMetadata, setSemanticMetadata] = useState(null);

  // Load Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.data.categories || []);
        }
      } catch (err) {
        console.warn('Failed to load categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // Sync URL search params with state
  useEffect(() => {
    const qParam = searchParams.get('q');
    const semParam = searchParams.get('semantic');
    const catParam = searchParams.get('category');
    if (qParam !== null) setSearchQuery(qParam);
    if (semParam !== null) setIsSemantic(semParam === 'true');
    if (catParam !== null) setSelectedCategory(catParam);
  }, [searchParams]);

  // Main Product Fetcher (Routes to /ai/search for semantic or /products for standard keyword/filters)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (searchQuery.trim() && isSemantic) {
          // AI Semantic Search Endpoint
          const res = await api.post('/ai/search', {
            query: searchQuery.trim(),
            limit: 20
          });

          if (res.data.success) {
            let items = res.data.products || [];
            // Apply category filter if selected
            if (selectedCategory) {
              items = items.filter(p => p.category_id === parseInt(selectedCategory, 10));
            }
            // Apply price filter
            items = items.filter(p => parseFloat(p.price) <= maxPrice);

            setProducts(items);
            setTotal(items.length);
            setSemanticMetadata({
              algorithm: res.data.algorithm,
              formula: res.data.formula,
              mode: res.data.mode,
              fallback: res.data.fallback,
              warning: res.data.warning
            });
          }
        } else {
          // Standard relational filtering endpoint
          setSemanticMetadata(null);
          const params = {
            page,
            limit: 16,
            sort,
            max_price: maxPrice
          };

          if (searchQuery.trim()) params.search = searchQuery.trim();
          if (selectedCategory) params.category_id = selectedCategory;
          if (selectedBrand) params.brand = selectedBrand;

          const res = await api.get('/products', { params });
          if (res.data.success) {
            setProducts(res.data.data.products || []);
            setTotal(res.data.data.total || 0);
          }
        }
      } catch (err) {
        console.error('Failed to load products:', err.message);
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, isSemantic, selectedCategory, selectedBrand, maxPrice, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({
      q: searchQuery,
      semantic: isSemantic,
      ...(selectedCategory && { category: selectedCategory })
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setMaxPrice(300000);
    setMinRating(0);
    setSort('newest');
    setSearchParams({});
  };

  const brands = ['Apple', 'Dell', 'Sony', 'Bose', 'Samsung', 'Nike', 'Asics', 'Herman Miller', 'Logitech', 'Keychron'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isSemantic
                  ? "Semantic search: 'comfortable shoes for marathon', 'macbook for coding'..."
                  : "Keyword search: 'Sony WH-1000XM5', 'Nike'..."
              }
              className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-sm pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setIsSemantic(true)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSemantic
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Semantic</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSemantic(false)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  !isSemantic
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                Keyword
              </button>
            </div>

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-sm transition-all"
            >
              Search
            </button>
          </div>
        </form>

        {/* Semantic Information Banner when Semantic Mode is active */}
        {isSemantic && searchQuery && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-900 space-y-1 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: '4s' }} />
              <div>
                <span className="font-bold">AI Vector Space Search Active: </span>
                <span>Calculating TF-IDF query-document cosine similarity: cos(Q, D) = (Q · D) / (||Q|| * ||D||)</span>
              </div>
            </div>
            {semanticMetadata?.fallback && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                Keyword Fallback
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Sidebar Filters + Products List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Filters</h3>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Reset All
              </button>
            </div>

            {/* Categories Filter */}
            <div>
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
                Categories
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                    selectedCategory === ''
                      ? 'bg-indigo-50 font-bold text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[11px] text-slate-400">52</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id.toString())}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                      selectedCategory === cat.id.toString()
                        ? 'bg-indigo-50 font-bold text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className="text-[11px] text-slate-400">{cat.product_count || 10}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Max Price
                </label>
                <span className="text-xs font-bold text-indigo-600">
                  ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="300000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹2,000</span>
                <span>₹3,00,000</span>
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
                Brand
              </label>
              <div className="flex flex-wrap gap-1.5">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(selectedBrand === b ? '' : b)}
                    className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
                      selectedBrand === b
                        ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-3 border border-slate-200 shadow-xs text-xs">
            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{products.length}</strong> products
              {searchQuery && <span> for "<span className="text-indigo-600 font-semibold">{searchQuery}</span>"</span>}
            </span>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Product Grid or Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                  <div className="aspect-[4/3] bg-slate-200 rounded-xl"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/3 pt-2"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} showAIBadge={true} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">No matching products found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range, toggling between Semantic and Keyword search, or resetting filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-indigo-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
