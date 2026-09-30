import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import AIExplanationBadge from './AIExplanationBadge';

const ProductCard = ({ product, showAIBadge = true }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const price = parseFloat(product.price);
  const originalPrice = product.original_price ? parseFloat(product.original_price) : null;
  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    const res = await addToCart(product.id, 1, product.name);
    setIsAdding(false);
    if (res?.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden">
      {/* Product Image & Badges */}
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Featured Tag */}
        {product.is_featured && (
          <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            Featured
          </span>
        )}

        {/* Discount Tag */}
        {discount && (
          <span className="absolute top-3 right-3 bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
            -{discount}%
          </span>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-medium uppercase tracking-wider text-indigo-600">
            {product.category?.name || product.brand}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-700">{parseFloat(product.rating || 4.5).toFixed(1)}</span>
            <span className="text-slate-400">({product.rating_count || 42})</span>
          </div>
        </div>

        <Link
          to={`/products/${product.id}`}
          className="font-semibold text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors text-base mb-1"
          title={product.name}
        >
          {product.name}
        </Link>

        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* AI Explanation Badge if provided by recommendation or semantic search */}
        {showAIBadge && (product.reason || product.explanation) && (
          <div className="mb-3">
            <AIExplanationBadge
              strategy={product.strategy_used || (product.similarity_score ? 'SEMANTIC MATCH' : 'AI RECOMMENDATION')}
              reason={product.reason || product.explanation}
              score={product.recommendation_score || product.similarity_score}
            />
          </div>
        )}

        {/* Pricing & Add to Cart Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
          <div>
            <div className="text-lg font-bold text-slate-900 tracking-tight">
              ₹{price.toLocaleString('en-IN')}
            </div>
            {originalPrice && (
              <div className="text-xs text-slate-400 line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/25'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
