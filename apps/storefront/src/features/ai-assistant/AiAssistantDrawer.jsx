import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  ShoppingBag, 
  Trash2, 
  ShieldCheck, 
  Bot,
  User,
  ArrowRight
} from 'lucide-react';
import { aiApi } from '../../lib/apiClient';
import { formatPrice } from '../../lib/formatters';

const PRESET_PROMPTS = [
  { label: '🎧 Best ANC headphones under ₹15,000', query: 'Best ANC headphones under ₹15,000' },
  { label: '⌚ Smart fitness wearables', query: 'Smart fitness watches and health tracking wearables' },
  { label: '⌨️ Mechanical keyboards', query: 'Ergonomic mechanical keyboards for work and coding' },
  { label: '🎒 Commuter backpack for travel', query: 'Waterproof commuter laptop bag for daily travel' },
];

export function AiAssistantDrawer({
  isOpen,
  onClose,
  onAddToCart,
  onSelectProduct,
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your Nexora AI Shopping Assistant. Tell me what you are looking for—budget, features, or daily use case—and I will recommend verified products from our catalog.',
      disclosure: 'AI-generated recommendations grounded in verified Nexora catalog data.',
      products: [],
      timestamp: new Date(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedProductId, setAddedProductId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryToSend) => {
    const query = (queryToSend || inputQuery).trim();
    if (!query || isLoading) return;

    // Append user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await aiApi.getRecommendations({ query });

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.explanation,
        products: response.products || [],
        modelUsed: response.modelUsed,
        disclosure: response.disclosure || 'Grounded in verified Nexora catalog facts.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        isError: true,
        text: err?.message || 'Sorry, I encountered an issue retrieving recommendations. Please try again.',
        disclosure: 'Catalog recommendation error.',
        products: [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: 'Chat history cleared. How can I help you find your next piece of gear today?',
        disclosure: 'AI-generated recommendations grounded in verified Nexora catalog data.',
        products: [],
        timestamp: new Date(),
      },
    ]);
  };

  const handleQuickAdd = (product) => {
    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        images: product.image ? [{ url: product.image }] : [],
        variants: [{ id: `var-${product.id}`, name: 'Standard', stockQuantity: product.stockQuantity || 10 }],
      });
      setAddedProductId(product.id);
      setTimeout(() => setAddedProductId(null), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-canvas border-l border-border shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-navy text-white flex items-center justify-between border-b border-white/10 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-royal-blue to-teal flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2 text-sm tracking-wide">
                  Nexora AI Assistant
                  <span className="text-[10px] bg-teal/20 text-teal-100 border border-teal/40 px-2 py-0.5 rounded-full font-mono font-semibold">
                    Catalog Grounded
                  </span>
                </h3>
                <p className="text-xs text-blue-200">
                  Strictly verified against live inventory
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearHistory}
                title="Clear conversation"
                className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-3 bg-white border-b border-border shadow-sm">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
              Suggested queries
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt.query)}
                  disabled={isLoading}
                  className="text-xs text-left bg-canvas hover:bg-royal-blue hover:text-white text-gray-800 border border-border rounded-xl px-2.5 py-1.5 transition-all shadow-sm font-medium disabled:opacity-50"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-royal-blue text-white rounded-tr-none'
                      : msg.isError
                      ? 'bg-red-50 border border-red-200 text-red-700 rounded-tl-none'
                      : 'bg-white border border-border text-gray-900 rounded-tl-none'
                  }`}
                >
                  {/* Sender icon */}
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs opacity-80">
                    {msg.sender === 'user' ? (
                      <>
                        <User className="w-3.5 h-3.5" />
                        <span className="font-semibold">You</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-3.5 h-3.5 text-royal-blue" />
                        <span className="font-bold text-navy">Nexora AI</span>
                      </>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* AI Disclosure Note */}
                  {msg.disclosure && (
                    <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center gap-1.5 text-[11px] text-muted">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                      <span>{msg.disclosure}</span>
                    </div>
                  )}

                  {/* Grounded Products List */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3.5 space-y-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                        Recommended Catalog Items:
                      </p>
                      {msg.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-canvas border border-border rounded-2xl p-2.5 flex items-center gap-3 hover:border-royal-blue transition-colors shadow-sm"
                        >
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-14 h-14 rounded-xl object-cover bg-white flex-shrink-0 border border-border"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-white border border-border flex items-center justify-center text-muted flex-shrink-0">
                              <ShoppingBag className="w-6 h-6 opacity-40" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-navy truncate">
                              {prod.name}
                            </h4>
                            <p className="text-[11px] text-muted capitalize">
                              {prod.category}
                            </p>
                            <p className="text-xs font-bold text-royal-blue mt-0.5">
                              {formatPrice(prod.price)}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleQuickAdd(prod)}
                              className={`px-2.5 py-1 text-[11px] rounded-xl font-bold flex items-center gap-1 transition-all shadow-sm ${
                                addedProductId === prod.id
                                  ? 'bg-teal text-white'
                                  : 'bg-navy hover:bg-royal-blue text-white'
                              }`}
                            >
                              <ShoppingBag className="w-3 h-3" />
                              {addedProductId === prod.id ? 'Added!' : 'Add'}
                            </button>
                            <button
                              onClick={() => {
                                onClose();
                                if (onSelectProduct) onSelectProduct(prod.slug);
                              }}
                              className="px-2 py-0.5 text-[10px] text-muted hover:text-navy border border-border rounded-lg hover:bg-white flex items-center justify-center gap-0.5 transition"
                            >
                              View <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking / Loading State */}
            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className="bg-white border border-border rounded-2xl rounded-tl-none p-4 shadow-sm text-sm text-muted flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-royal-blue animate-spin" />
                  <span className="font-medium text-navy">Searching catalog facts and generating recommendation...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3.5 bg-white border-t border-border shadow-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                maxLength={500}
                placeholder="Ask e.g. 'ANC headphones under ₹15,000'..."
                className="flex-1 bg-canvas border border-border rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-royal-blue focus:bg-white transition"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="bg-navy hover:bg-royal-blue disabled:opacity-50 text-white p-2.5 rounded-2xl shadow-md transition flex items-center justify-center active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-muted mt-2 px-1">
              <span>{inputQuery.length}/500 chars</span>
              <span>Press Enter to ask</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Floating AI Trigger Button component (compact & sleek)
 */
export function AiAssistantTrigger({ onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-navy to-royal-blue hover:from-royal-blue hover:to-teal text-white px-3.5 py-2 rounded-full shadow-md flex items-center gap-2 font-medium text-xs transition-all hover:scale-105 active:scale-95 border border-white/20 group cursor-pointer pointer-events-auto"
      aria-label="Open Nexora AI Shopping Assistant"
      title="Ask Nexora AI"
    >
      <Sparkles className="w-3.5 h-3.5 text-teal group-hover:rotate-12 transition-transform" />
      <span className="font-semibold text-xs text-white">Ask AI</span>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
      </span>
    </button>
  );
}
