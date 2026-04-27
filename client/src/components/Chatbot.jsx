import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Minimize2, Maximize2, Trash2, Zap, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API from '../services/api';
import { cn } from '../lib/utils';

const WELCOME_MESSAGE = {
    role: 'assistant',
    content: `👋 Hello! I'm **SecureCloud AI** — your intelligent security assistant.

I can help you with:
- 🔐 **Encryption** (AES-256-GCM, CP-ABE, ChaCha20)
- 🌐 **Distributed Architecture** & Node health
- 🛡️ **Security Best Practices** & Compliance
- 📊 **Your Live System Status**
- 🔑 **Key Management & Rotation**

*Loading your personalized suggestions...*`,
    timestamp: new Date().toISOString()
};

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [systemContext, setSystemContext] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && !isMinimized && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, isMinimized]);

    // Reset unread count when opened
    useEffect(() => {
        if (isOpen) setUnreadCount(0);
    }, [isOpen]);

    // Fetch dynamic suggestions on open
    const fetchSuggestions = useCallback(async () => {
        setLoadingSuggestions(true);
        try {
            const { data } = await API.get('/chatbot/suggestions');
            setSuggestions(data.suggestions || []);
        } catch {
            setSuggestions([
                "What is the current system status?",
                "How does AES-256-GCM encryption work?",
                "Explain CP-ABE access policies",
                "How do I rotate my encryption keys?",
                "Show me compliance standards"
            ]);
        } finally {
            setLoadingSuggestions(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) fetchSuggestions();
    }, [isOpen, fetchSuggestions]);

    const sendMessage = async (msgText) => {
        const text = (msgText || input).trim();
        if (!text || isLoading) return;

        const userMsg = {
            role: 'user',
            content: text,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const { data } = await API.post('/chatbot', {
                message: text,
                history: messages
                    .filter(m => m.role !== 'assistant' || messages.indexOf(m) !== 0)
                    .map(m => ({ role: m.role, content: m.content }))
                    .slice(-12) // keep last 12 messages for context
            });

            const botMsg = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMsg]);

            if (data.context) setSystemContext(data.context);
            if (!isOpen) setUnreadCount(c => c + 1);

            // Refresh suggestions after each reply
            fetchSuggestions();

        } catch (error) {
            const errMsg = error.response?.data?.message || 'Connection error. Please check if the backend server is running.';
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `**Error:** ${errMsg}`,
                timestamp: new Date().toISOString(),
                isError: true
            }]);
            if (error.response?.status === 401) {
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }, 2000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    };

    const handleSuggestion = (s) => {
        sendMessage(s);
    };

    const clearChat = () => {
        if (window.confirm('Clear all messages?')) {
            setMessages([{
                ...WELCOME_MESSAGE,
                content: 'Chat history cleared. How can I help you today?',
                timestamp: new Date().toISOString()
            }]);
            fetchSuggestions();
        }
    };

    const fmtTime = (iso) => {
        try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
        catch { return ''; }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, height: isMinimized ? '60px' : '620px' }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={cn(
                            "w-[92vw] md:w-[470px] bg-gray-950/90 backdrop-blur-xl border border-gray-800/80 rounded-2xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden mb-4",
                            isMinimized ? "h-[60px]" : "h-[620px]"
                        )}
                    >
                        {/* Header */}
                        <div className="shrink-0 p-4 bg-gradient-to-r from-gray-900/80 to-gray-900/40 border-b border-gray-800/60 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/20">
                                        <Bot size={20} className="text-primary" />
                                    </div>
                                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-gray-950 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                </div>
                                <div>
                                    <span className="font-black text-white text-sm tracking-tight block">SECURECLOUD AI</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Live Assistant</span>
                                        {systemContext && (
                                            <span className="text-[9px] text-primary/60 font-mono">
                                                · {systemContext.activeNodes}/{systemContext.totalNodes} nodes
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={fetchSuggestions}
                                    title="Refresh suggestions"
                                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-primary transition-all"
                                >
                                    <RefreshCw size={14} className={loadingSuggestions ? 'animate-spin' : ''} />
                                </button>
                                <button
                                    onClick={clearChat}
                                    title="Clear chat"
                                    className="p-2 hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-danger transition-all"
                                >
                                    <Trash2 size={15} />
                                </button>
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all"
                                >
                                    {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all"
                                >
                                    <X size={17} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <div
                                    ref={scrollRef}
                                    className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-gray-800 hover:scrollbar-thumb-gray-700"
                                >
                                    {messages.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}
                                        >
                                            {/* Avatar */}
                                            <div className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg mt-1",
                                                msg.role === 'user'
                                                    ? "bg-primary text-black"
                                                    : msg.isError
                                                        ? "bg-danger/20 text-danger border border-danger/30"
                                                        : "bg-gray-900 text-primary border border-gray-800"
                                            )}>
                                                {msg.role === 'user' ? <User size={16} strokeWidth={2.5} /> : <Bot size={16} strokeWidth={2.5} />}
                                            </div>

                                            {/* Bubble */}
                                            <div className="max-w-[82%]">
                                                <div className={cn(
                                                    "p-3.5 rounded-2xl text-[13.5px] leading-relaxed",
                                                    msg.role === 'user'
                                                        ? "bg-primary text-black font-semibold rounded-tr-sm"
                                                        : msg.isError
                                                            ? "bg-danger/10 border border-danger/20 text-danger rounded-tl-sm"
                                                            : "bg-gray-900/70 border border-gray-800/80 text-gray-200 rounded-tl-sm ring-1 ring-white/5"
                                                )}>
                                                    <div className={cn(
                                                        "prose prose-sm max-w-none break-words",
                                                        msg.role === 'user'
                                                            ? "prose-p:text-black prose-li:text-black prose-strong:text-black prose-headings:text-black"
                                                            : "prose-invert prose-strong:text-primary prose-headings:text-white prose-code:text-primary prose-code:bg-black/40 prose-code:px-1 prose-code:rounded prose-table:text-xs"
                                                    )}>
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                                <p className={cn(
                                                    "text-[10px] text-gray-600 mt-1 px-1",
                                                    msg.role === 'user' ? "text-right" : "text-left"
                                                )}>
                                                    {fmtTime(msg.timestamp)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Typing indicator */}
                                    {isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0">
                                                <Bot size={16} className="text-primary" />
                                            </div>
                                            <div className="bg-gray-900/70 border border-gray-800/80 p-3.5 rounded-2xl rounded-tl-sm">
                                                <div className="flex gap-1.5 items-center py-0.5">
                                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-2 h-2 bg-primary/70 rounded-full" />
                                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.25 }} className="w-2 h-2 bg-primary/70 rounded-full" />
                                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.5 }} className="w-2 h-2 bg-primary/70 rounded-full" />
                                                    <span className="text-[11px] text-gray-500 ml-2">Thinking...</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Suggestions */}
                                {suggestions.length > 0 && !isLoading && (
                                    <div className="shrink-0 px-4 pt-2 pb-1">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                                            <Zap size={10} className="text-primary" /> Suggested
                                        </p>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {suggestions.slice(0, 3).map((s, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSuggestion(s)}
                                                    className="text-[11px] px-2.5 py-1.5 bg-gray-900 hover:bg-primary/10 border border-gray-800 hover:border-primary/30 text-gray-400 hover:text-primary rounded-lg transition-all text-left line-clamp-1 max-w-[200px]"
                                                    title={s}
                                                >
                                                    {s.length > 35 ? s.slice(0, 35) + '…' : s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Input */}
                                <form onSubmit={handleSubmit} className="shrink-0 p-4 bg-gray-900/30 border-t border-gray-800/60">
                                    <div className="relative flex gap-2">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask about encryption, nodes, compliance..."
                                            disabled={isLoading}
                                            className="flex-1 bg-gray-950/70 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-600 disabled:opacity-50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || isLoading}
                                            className="shrink-0 w-11 h-11 bg-primary text-black rounded-xl flex items-center justify-center hover:bg-primaryHover hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                        >
                                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} strokeWidth={2.5} />}
                                        </button>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between px-1">
                                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                                            Gemini 1.5 Flash · Local KB
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.5)]"></div>
                                            <span className="text-[9px] text-success/80 font-bold uppercase tracking-widest">Online</span>
                                        </div>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launcher Button */}
            {!isOpen && (
                <motion.button
                    onClick={() => setIsOpen(true)}
                    whileHover={{ scale: 1.1, rotate: 6 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-black shadow-[0_12px_40px_rgba(34,211,238,0.4)]"
                >
                    <div className="absolute inset-0 bg-primary rounded-2xl animate-ping opacity-10"></div>
                    <MessageSquare size={28} strokeWidth={2.5} className="relative z-10" />

                    {/* Unread badge */}
                    {unreadCount > 0 && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-danger text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-gray-950 shadow-lg">
                            {unreadCount}
                        </div>
                    )}

                    {/* Online dot */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-success border-[3px] border-gray-950 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>

                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 bg-gray-900/95 backdrop-blur border border-gray-800 px-4 py-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-2 group-hover:translate-x-0 shadow-2xl whitespace-nowrap">
                        <p className="text-white text-[11px] font-black uppercase tracking-[0.15em]">Ask SecureCloud AI</p>
                        <p className="text-gray-500 text-[9px] mt-0.5">Powered by Gemini + Local KB</p>
                    </div>
                </motion.button>
            )}
        </div>
    );
};

export default Chatbot;
