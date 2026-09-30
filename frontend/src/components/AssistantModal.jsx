import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const SUGGESTED_PROMPTS = [
  "I need running shoes under ₹16,000 for marathon training",
  "Best laptop for machine learning and programming under ₹2,00,000",
  "Ergonomic chair with lumbar support for coding desk",
  "Active noise cancelling headphones for focused work"
];

const AssistantModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Shopping Assistant. Tell me what you're looking for, your budget, or specific use cases (e.g. *'I need running shoes under ₹5,000'*), and I will find the best matches from our live catalog.",
      products: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  if (!isOpen) return null;

  const handleSend = async (queryText = null) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await api.post('/ai/assistant', {
        message: textToSend,
        history: historyPayload
      });

      if (res.data.success) {
        const assistantMsg = {
          role: 'assistant',
          content: res.data.reply,
          products: res.data.suggested_products || [],
          filters: res.data.parsed_filters,
          intent: res.data.intent
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I apologize, I'm having trouble connecting to the catalog right now. Please try again or browse products directly.",
          products: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[650px] max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center space-x-2">
                <span>AI Shopping Assistant</span>
                <span className="text-[10px] bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded-full font-mono uppercase">Live Catalog</span>
              </h3>
              <p className="text-xs text-indigo-200">Natural Language Constraint Parser & Product Ranker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat History Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[82%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`inline-block text-sm p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                      : 'bg-white text-slate-800 border border-slate-200/80 shadow-sm rounded-tl-sm'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                </div>

                {/* Parsed Constraint Chips */}
                {msg.filters && (msg.filters.budget_max || msg.filters.categories?.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.filters.budget_max && (
                      <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Max Budget: ₹{msg.filters.budget_max.toLocaleString('en-IN')}
                      </span>
                    )}
                    {msg.filters.categories?.map((c, i) => (
                      <span key={i} className="text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md uppercase">
                        Category: {c}
                      </span>
                    ))}
                    {msg.filters.intents?.map((intent, i) => (
                      <span key={i} className="text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                        Intent: {intent}
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Product Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {msg.products.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-col p-3 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:border-indigo-300 transition-all text-left"
                      >
                        <div className="flex items-center space-x-2.5">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">
                              AI
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 truncate" title={p.name}>
                              {p.name}
                            </h5>
                            <p className="text-xs font-bold text-indigo-600">
                              ₹{parseFloat(p.price || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                          {p.match_reason || 'Matches criteria'}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                          <Link
                            to={`/products/${p.id}`}
                            onClick={onClose}
                            className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 flex items-center space-x-1"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => addToCart(p.id, 1, p.name)}
                            className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2 py-1 rounded-md"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 text-slate-500 text-xs italic">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <span>Analyzing your constraints and ranking live catalog...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-6 py-2.5 border-t border-slate-100 bg-white flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex-shrink-0">Suggestions:</span>
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="flex-shrink-0 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 px-3 py-1 rounded-full text-slate-600 transition-colors truncate max-w-xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 'I need a laptop for programming under ₹70,000'..."
              className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-sm px-4 py-3 rounded-2xl border border-transparent focus:border-indigo-500 focus:outline-none transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-12 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center transition-all shadow-md shadow-indigo-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssistantModal;
