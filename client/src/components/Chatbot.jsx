import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Minimize2, Maximize2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API from '../services/api';
import { cn } from '../lib/utils';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am **SecureCloud AI**. I can help you with questions about:\n\n*   **Cloud Security** & Best Practices\n*   **Encryption Algorithms** (AES, CP-ABE, RSA)\n*   **Distributed Storage** Architecture\n*   **Threat Detection** & Risk Analysis' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const { data } = await API.post('/chatbot', {
                message: input,
                history: messages.map(m => ({ role: m.role, content: m.content })).slice(-10)
            });

            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error('Chat Error:', error);
            const serverError = error.response?.data?.message || 'Connection error. Check backend status.';
            setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${serverError}` }]);

            if (error.response?.status === 401) {
                // Potential token issue
                localStorage.removeItem('token');
                setMessages(prev => [...prev, { role: 'assistant', content: 'Your session may have expired. Please refresh or re-login.' }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        if (window.confirm('Clear all messages?')) {
            setMessages([{ role: 'assistant', content: 'Chat history cleared. How else can I help you today?' }]);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            height: isMinimized ? '60px' : '550px'
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={cn(
                            "w-[90vw] md:w-[450px] bg-gray-950/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden mb-4 transition-all duration-300",
                            isMinimized ? "h-[60px]" : "h-[550px]"
                        )}
                    >
                        {/* Header */}
                        <div className="p-4 bg-gray-900/40 border-b border-gray-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/20 rounded-xl shadow-lg shadow-primary/5">
                                    <Bot size={20} className="text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-white text-sm tracking-tight">SECURECLOUD AI</span>
                                    <div className="flex items-center gap-1.5 leading-none">
                                        <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-0.5">Live Assistant</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={clearChat}
                                    title="Clear Chat"
                                    className="p-2 hover:bg-error/10 rounded-lg text-gray-400 hover:text-error transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all outline-none"
                                >
                                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all outline-none"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages Container */}
                                <div
                                    ref={scrollRef}
                                    className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-800/50 hover:scrollbar-thumb-gray-700"
                                >
                                    {messages.map((msg, i) => (
                                        <div key={i} className={cn(
                                            "flex gap-3",
                                            msg.role === 'user' ? "flex-row-reverse" : ""
                                        )}>
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xl",
                                                msg.role === 'user'
                                                    ? "bg-primary text-black ring-2 ring-primary/20"
                                                    : "bg-gray-900 text-primary border border-gray-800"
                                            )}>
                                                {msg.role === 'user' ? <User size={18} strokeWidth={2.5} /> : <Bot size={18} strokeWidth={2.5} />}
                                            </div>
                                            <div className={cn(
                                                "max-w-[85%] p-4 rounded-2xl text-[14px] leading-relaxed relative group",
                                                msg.role === 'user'
                                                    ? "bg-primary text-black font-semibold rounded-tr-none shadow-lg shadow-primary/10"
                                                    : "bg-gray-900/60 border border-gray-800/80 text-gray-200 rounded-tl-none ring-1 ring-white/5"
                                            )}>
                                                <div className={cn(
                                                    "prose prose-invert prose-sm max-w-none break-words",
                                                    msg.role === 'user' ? "prose-p:text-black prose-li:text-black prose-strong:text-black" : "prose-strong:text-primary"
                                                )}>
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0">
                                                <Bot size={18} className="text-primary" />
                                            </div>
                                            <div className="bg-gray-900/40 border border-gray-800/50 p-4 rounded-2xl rounded-tl-none">
                                                <div className="flex gap-1.5 py-1">
                                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-primary/60 rounded-full" />
                                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-primary/60 rounded-full" />
                                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-primary/60 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSend} className="p-4 bg-gray-900/30 border-t border-gray-800/50">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Message SecureCloud AI..."
                                            className="w-full bg-gray-950/50 border border-gray-800 rounded-xl pl-4 pr-12 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-600"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || isLoading}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-black rounded-lg hover:bg-primaryHover hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                        >
                                            <Send size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between px-1 opacity-60">
                                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">
                                            Gemini 1.5 Flash
                                        </span>
                                        <span className="text-[9px] text-primary/80 font-black uppercase tracking-widest animate-pulse">
                                            Online
                                        </span>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launcher Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-black shadow-[0_12px_40px_rgba(34,211,238,0.4)] hover:scale-110 active:scale-95 transition-all duration-500 hover:rotate-6"
                >
                    <div className="absolute inset-0 bg-primary rounded-2xl animate-ping opacity-10"></div>
                    <MessageSquare size={30} strokeWidth={2.5} className="relative z-10" />

                    {/* Status Dot */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-success border-[3px] border-gray-950 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>

                    {/* Tooltip */}
                    <div className="absolute right-full mr-5 bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-x-4 group-hover:translate-x-0 shadow-2xl">
                        <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Ask SecureCloud AI</span>
                    </div>
                </button>
            )}
        </div>
    );
};

export default Chatbot;
