import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  ShoppingBag, 
  ExternalLink, 
  Trash2, 
  ShieldCheck, 
  AlertCircle,
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-canvas border-l border-border-subtle shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-surface border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-content-primary flex items-center gap-2 text-sm">
                  Nexora AI Assistant
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-medium">
                    Catalog Grounded
                  </span>
                </h3>
                <p className="text-xs text-content-subtle">
                  Strictly verified against live inventory
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearHistory}
                title="Clear conversation"
                className="p-2 text-content-subtle hover:text-content-primary hover:bg-canvas rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-content-subtle hover:text-content-primary hover:bg-canvas rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-3 bg-surface/50 border-b border-border-subtle">
            <p className="text-[11px] font-medium text-content-subtle uppercase tracking-wider mb-2">
              Suggested queries
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt.query)}
                  disabled={isLoading}
                  className="text-xs text-left bg-canvas hover:bg-border-subtle text-content-muted hover:text-content-primary border border-border-subtle rounded-lg px-2.5 py-1 transition-all disabled:opacity-50"
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
                  className={`max-w-[88%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-accent-primary text-white rounded-tr-none'
                      : msg.isError
                      ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-tl-none'
                      : 'bg-surface border border-border-subtle text-content-primary rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Sender icon */}
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs opacity-75">
                    {msg.sender === 'user' ? (
                      <>
                        <User className="w-3.5 h-3.5" />
                        <span>You</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-3.5 h-3.5 text-accent-primary" />
                        <span className="font-medium text-accent-primary">Nexora AI</span>
                      </>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* AI Disclosure Note */}
                  {msg.disclosure && (
                    <div className="mt-2.5 pt-2 border-t border-border-subtle/50 flex items-center gap-1.5 text-[11px] text-content-subtle">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{msg.disclosure}</span>
                    </div>
                  )}

                  {/* Grounded Products List */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3.5 space-y-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
                        Recommended Catalog Items:
                      </p>
                      {msg.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-canvas border border-border-subtle rounded-xl p-2.5 flex items-center gap-3 hover:border-accent-primary/40 transition-colors"
                        >
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-14 h-14 rounded-lg object-cover bg-surface flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-surface flex items-center justify-center text-content-subtle flex-shrink-0">
                              <ShoppingBag className="w-6 h-6 opacity-40" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-content-primary truncate">
                              {prod.name}
                            </h4>
                            <p className="text-[11px] text-content-subtle capitalize">
                              {prod.category}
                            </p>
                            <p className="text-xs font-bold text-accent-primary mt-0.5">
                              {formatPrice(prod.price)}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleQuickAdd(prod)}
                              className={`px-2 py-1 text-[11px] rounded font-medium flex items-center gap-1 transition-all ${
                                addedProductId === prod.id
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-accent-primary hover:bg-accent-hover text-white'
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
                              className="px-2 py-0.5 text-[10px] text-content-muted hover:text-content-primary border border-border-subtle rounded hover:bg-surface flex items-center justify-center gap-0.5"
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
                <div className="bg-surface border border-border-subtle rounded-2xl rounded-tl-none p-3.5 shadow-sm text-sm text-content-subtle flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-primary animate-spin" />
                  <span>Searching catalog and generating grounded answer...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-surface border-t border-border-subtle">
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
                className="flex-1 bg-canvas border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm text-content-primary placeholder:text-content-subtle focus:outline-none focus:border-accent-primary transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white p-2.5 rounded-xl transition-all flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-content-subtle mt-2 px-1">
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
 * Floating AI Trigger Button component
 */
export function AiAssistantTrigger({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-accent-hover hover:to-indigo-500 text-white px-4 py-3 rounded-full shadow-xl flex items-center gap-2.5 font-medium text-sm transition-all transform hover:scale-105 active:scale-95 group border border-white/10"
      aria-label="Open Nexora AI Shopping Assistant"
    >
      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
        <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
      </div>
      <span>Ask Nexora AI</span>
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
    </button>
  );
}
