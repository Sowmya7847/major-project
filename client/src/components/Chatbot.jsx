import { useState, useRef, useEffect, useCallback } from 'react';
import {
    MessageSquare, Send, X, Bot, User, Minimize2, Maximize2,
    Trash2, Zap, RefreshCw, Copy, Check, Square, ChevronDown,
    Sparkles, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import API from '../services/api';
import { cn } from '../lib/utils';

/* ─── helpers ──────────────────────────────────────────── */
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const WELCOME = {
    role: 'assistant',
    content: `# 👋 Hello! I'm **SecureCloud AI**

I'm your intelligent security assistant — powered by **Gemini 1.5 Flash** with a comprehensive local knowledge base.

I can help you with:
| Topic | Examples |
|-------|---------|
| 🔐 **Encryption** | AES-256-GCM, CP-ABE, ChaCha20 |
| 🌐 **Architecture** | Nodes, Gateway, Workers |
| 🛡️ **Security** | Compliance, HMAC, Auditing |
| 📊 **System Status** | Live metrics & alerts |
| 🔑 **Key Management** | Rotation, lifecycle, policies |

*Loading personalized suggestions...*`,
    id: 'welcome',
    ts: Date.now()
};

/* ─── code block with copy ──────────────────────────────── */
const CodeBlock = ({ inline, className, children }) => {
    const [copied, setCopied] = useState(false);
    const lang = /language-(\w+)/.exec(className || '')?.[1] || 'text';
    const code = String(children).replace(/\n$/, '');

    if (inline) return (
        <code className="bg-black/40 text-primary px-1.5 py-0.5 rounded text-[0.8em] font-mono">
            {children}
        </code>
    );

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-3 rounded-xl overflow-hidden border border-gray-700/60">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-700/40">
                <span className="text-[11px] text-gray-400 font-mono uppercase tracking-wider">{lang}</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors">
                    {copied ? <><Check size={12} className="text-success" /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
            </div>
            <SyntaxHighlighter
                style={oneDark}
                language={lang}
                PreTag="div"
                customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px', background: 'rgba(0,0,0,0.5)' }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

/* ─── message bubble ────────────────────────────────────── */
const Message = ({ msg, onCopy, onRegenerate, isLast }) => {
    const [copied, setCopied] = useState(false);
    const isUser = msg.role === 'user';

    const handleCopy = () => {
        navigator.clipboard.writeText(msg.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        onCopy?.();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn('group flex gap-3 px-2', isUser ? 'flex-row-reverse' : 'flex-row')}
        >
            {/* Avatar */}
            <div className={cn(
                'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-1 shadow-lg',
                isUser
                    ? 'bg-gradient-to-br from-primary to-blue-400 text-black'
                    : msg.isError
                        ? 'bg-danger/20 border border-danger/30 text-danger'
                        : 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 text-primary'
            )}>
                {isUser ? <User size={15} strokeWidth={2.5} /> : <Bot size={15} strokeWidth={2.5} />}
            </div>

            {/* Bubble */}
            <div className={cn('flex flex-col max-w-[85%]', isUser ? 'items-end' : 'items-start')}>
                <div className={cn(
                    'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    isUser
                        ? 'bg-gradient-to-br from-primary to-cyan-400 text-black font-medium rounded-tr-sm'
                        : msg.isError
                            ? 'bg-danger/10 border border-danger/20 text-danger rounded-tl-sm'
                            : 'bg-gray-900/80 border border-gray-800/80 text-gray-100 rounded-tl-sm backdrop-blur-sm'
                )}>
                    {msg.streaming && !msg.content ? (
                        <div className="flex gap-1.5 py-1 items-center">
                            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-primary/70 rounded-full" />
                            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-primary/70 rounded-full" />
                            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-primary/70 rounded-full" />
                            <span className="text-xs text-gray-400 ml-1">Thinking...</span>
                        </div>
                    ) : (
                        <div className={cn(
                            'prose prose-sm max-w-none break-words',
                            isUser
                                ? 'prose-p:text-black prose-li:text-black prose-strong:text-black prose-headings:text-black'
                                : 'prose-invert prose-strong:text-primary prose-headings:text-white prose-a:text-primary prose-table:text-xs'
                        )}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{ code: CodeBlock }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Actions row */}
                <div className={cn(
                    'flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity',
                    isUser ? 'flex-row-reverse' : 'flex-row'
                )}>
                    <span className="text-[10px] text-gray-600">
                        {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && !msg.streaming && (
                        <>
                            <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors px-1.5 py-0.5 rounded hover:bg-gray-800">
                                {copied ? <Check size={10} className="text-success" /> : <Copy size={10} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                            {isLast && onRegenerate && (
                                <button onClick={onRegenerate} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-gray-800">
                                    <RefreshCw size={10} /> Regenerate
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

/* ─── main Chatbot component ────────────────────────────── */
const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([WELCOME]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [systemCtx, setSystemCtx] = useState(null);
    const [unread, setUnread] = useState(0);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [abortCtrl, setAbortCtrl] = useState(null);

    const scrollRef = useRef(null);
    const textareaRef = useRef(null);
    const bottomRef = useRef(null);

    /* auto-scroll */
    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { if (isStreaming) scrollToBottom(); }, [messages, isStreaming, scrollToBottom]);

    const onScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 120);
    };

    /* textarea auto-resize */
    const resizeTextarea = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    };

    useEffect(() => { resizeTextarea(); }, [input]);

    /* open/close side effects */
    useEffect(() => {
        if (isOpen) {
            setUnread(0);
            fetchSuggestions();
            setTimeout(() => textareaRef.current?.focus(), 300);
        }
    }, [isOpen]);

    /* suggestions */
    const fetchSuggestions = useCallback(async () => {
        setLoadingSuggestions(true);
        try {
            const { data } = await API.get('/chatbot/suggestions');
            setSuggestions(data.suggestions || []);
        } catch {
            setSuggestions([
                'What is the current system status?',
                'How does AES-256-GCM work?',
                'Explain CP-ABE access policies',
                'How do I rotate encryption keys?',
            ]);
        } finally {
            setLoadingSuggestions(false);
        }
    }, []);

    /* ── stream send ── */
    const sendMessage = useCallback(async (text) => {
        const msg = (text || input).trim();
        if (!msg || isStreaming) return;

        const userMsg = { role: 'user', content: msg, id: Date.now(), ts: Date.now() };
        const botId = Date.now() + 1;
        const botMsg = { role: 'assistant', content: '', id: botId, ts: Date.now(), streaming: true };

        setMessages(prev => [...prev, userMsg, botMsg]);
        setInput('');
        setIsStreaming(true);

        const token = localStorage.getItem('token');
        const ctrl = new AbortController();
        setAbortCtrl(ctrl);

        try {
            const history = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({ role: m.role, content: m.content }))
                .slice(-14);

            const res = await fetch(`${BASE}/chatbot/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ message: msg, history }),
                signal: ctrl.signal
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data:')) continue;
                    try {
                        const payload = JSON.parse(line.slice(5).trim());
                        if (payload.chunk) {
                            fullText += payload.chunk;
                            setMessages(prev => prev.map(m =>
                                m.id === botId ? { ...m, content: fullText, streaming: true } : m
                            ));
                        }
                        if (payload.done) break;
                        if (payload.error) throw new Error(payload.error);
                    } catch { /* ignore bad JSON */ }
                }
            }

            // Finalise
            setMessages(prev => prev.map(m =>
                m.id === botId ? { ...m, content: fullText, streaming: false } : m
            ));

            if (!isOpen) setUnread(c => c + 1);
            fetchSuggestions();

        } catch (err) {
            if (err.name === 'AbortError') {
                setMessages(prev => prev.map(m =>
                    m.id === botId ? { ...m, content: m.content + ' *(stopped)*', streaming: false } : m
                ));
            } else {
                setMessages(prev => prev.map(m =>
                    m.id === botId
                        ? { ...m, content: `**Error:** ${err.message || 'Connection failed. Is the backend running?'}`, streaming: false, isError: true }
                        : m
                ));
            }
        } finally {
            setIsStreaming(false);
            setAbortCtrl(null);
        }
    }, [input, isStreaming, messages, isOpen, fetchSuggestions]);

    const stopStreaming = () => abortCtrl?.abort();

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const regenerate = () => {
        // Find last user message and re-send
        const lastUser = [...messages].reverse().find(m => m.role === 'user');
        if (!lastUser) return;
        setMessages(prev => prev.slice(0, -1)); // remove last bot msg
        sendMessage(lastUser.content);
    };

    const clearChat = () => {
        if (window.confirm('Clear all messages?')) {
            setMessages([{ ...WELCOME, content: 'Chat cleared. How can I help you?', ts: Date.now() }]);
            fetchSuggestions();
        }
    };

    /* ── render ── */
    const windowClass = cn(
        'bg-gray-950/95 backdrop-blur-xl border border-gray-800/80 rounded-2xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden mb-4 transition-all duration-300',
        isFullscreen
            ? 'fixed inset-4 z-50 rounded-3xl mb-0'
            : isMinimized
                ? 'w-[380px] h-[60px]'
                : 'w-[92vw] md:w-[520px] h-[680px]'
    );

    return (
        <div className={cn('fixed z-50 flex flex-col items-end font-sans', isFullscreen ? 'inset-0' : 'bottom-6 right-6')}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="chat-window"
                        initial={{ opacity: 0, scale: 0.94, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 16 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className={windowClass}
                    >
                        {/* ── Header ── */}
                        <div className="shrink-0 px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-900/60 border-b border-gray-800/60 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-blue-500/20 border border-primary/30 flex items-center justify-center">
                                        <Sparkles size={18} className="text-primary" />
                                    </div>
                                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-gray-950 shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
                                </div>
                                <div>
                                    <p className="font-black text-white text-sm tracking-tight">SecureCloud AI</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            Gemini 1.5 Flash
                                            {systemCtx && ` · ${systemCtx.activeNodes}/${systemCtx.totalNodes} nodes`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-0.5">
                                <button onClick={fetchSuggestions} title="Refresh" className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-primary transition-all">
                                    <RefreshCw size={13} className={loadingSuggestions ? 'animate-spin' : ''} />
                                </button>
                                <button onClick={clearChat} title="Clear" className="p-2 hover:bg-red-950/40 rounded-lg text-gray-500 hover:text-danger transition-all">
                                    <Trash2 size={13} />
                                </button>
                                <button onClick={() => setIsFullscreen(f => !f)} title="Fullscreen" className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-all">
                                    <Maximize2 size={13} />
                                </button>
                                <button onClick={() => setIsMinimized(m => !m)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-all">
                                    <Minimize2 size={13} />
                                </button>
                                <button onClick={() => { setIsOpen(false); setIsFullscreen(false); }} className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-all">
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* ── Messages ── */}
                                <div
                                    ref={scrollRef}
                                    onScroll={onScroll}
                                    className="flex-1 overflow-y-auto py-5 space-y-5 scrollbar-thin scrollbar-thumb-gray-800 hover:scrollbar-thumb-gray-700"
                                >
                                    {messages.map((msg, i) => (
                                        <Message
                                            key={msg.id}
                                            msg={msg}
                                            isLast={i === messages.length - 1}
                                            onRegenerate={!isStreaming ? regenerate : null}
                                        />
                                    ))}
                                    <div ref={bottomRef} />
                                </div>

                                {/* scroll-to-bottom button */}
                                <AnimatePresence>
                                    {showScrollBtn && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            onClick={scrollToBottom}
                                            className="absolute bottom-40 right-5 w-8 h-8 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white shadow-lg"
                                        >
                                            <ChevronDown size={16} />
                                        </motion.button>
                                    )}
                                </AnimatePresence>

                                {/* ── Suggestions ── */}
                                <AnimatePresence>
                                    {suggestions.length > 0 && !isStreaming && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="shrink-0 px-4 pt-2 pb-1 border-t border-gray-800/40"
                                        >
                                            <p className="text-[9px] text-gray-600 uppercase font-black tracking-[0.2em] mb-2 flex items-center gap-1">
                                                <Zap size={9} className="text-primary" /> Suggestions
                                            </p>
                                            <div className="flex gap-1.5 flex-wrap">
                                                {suggestions.slice(0, 3).map((s, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => sendMessage(s)}
                                                        className="text-[11px] px-2.5 py-1.5 bg-gray-900/80 hover:bg-primary/10 border border-gray-800/60 hover:border-primary/40 text-gray-400 hover:text-primary rounded-xl transition-all text-left"
                                                        title={s}
                                                    >
                                                        {s.length > 38 ? s.slice(0, 38) + '…' : s}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* ── Input ── */}
                                <div className="shrink-0 p-3 border-t border-gray-800/60 bg-gray-900/30">
                                    <div className="flex items-end gap-2 bg-gray-900/80 border border-gray-700/60 rounded-2xl px-4 py-3 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/15 transition-all">
                                        <textarea
                                            ref={textareaRef}
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Message SecureCloud AI…  (Shift+Enter for new line)"
                                            disabled={isStreaming}
                                            rows={1}
                                            className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none min-h-[24px] max-h-[160px] disabled:opacity-50 leading-relaxed"
                                        />
                                        <div className="flex items-center gap-1.5 shrink-0 mb-0.5">
                                            {isStreaming ? (
                                                <button
                                                    onClick={stopStreaming}
                                                    className="w-9 h-9 bg-danger/10 border border-danger/30 text-danger rounded-xl flex items-center justify-center hover:bg-danger hover:text-white transition-all"
                                                    title="Stop"
                                                >
                                                    <Square size={14} fill="currentColor" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={!input.trim()}
                                                    className="w-9 h-9 bg-primary text-black rounded-xl flex items-center justify-center hover:bg-cyan-300 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                                >
                                                    <Send size={16} strokeWidth={2.5} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-gray-700 text-center mt-2 font-medium">
                                        SecureCloud AI · Gemini 1.5 Flash + Local KB · Enter to send · Shift+Enter for new line
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Launcher ── */}
            {!isOpen && (
                <motion.button
                    onClick={() => setIsOpen(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative w-16 h-16 bg-gradient-to-br from-primary to-cyan-400 rounded-2xl flex items-center justify-center text-black shadow-[0_12px_40px_rgba(34,211,238,0.5)]"
                >
                    <div className="absolute inset-0 rounded-2xl bg-primary animate-ping opacity-10" />
                    <Sparkles size={26} strokeWidth={2} className="relative z-10" />

                    {unread > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-danger text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-gray-950"
                        >
                            {unread}
                        </motion.div>
                    )}

                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-success border-[3px] border-gray-950 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]" />

                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 bg-gray-900/95 border border-gray-800 px-4 py-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-2 group-hover:translate-x-0 shadow-2xl whitespace-nowrap">
                        <p className="text-white text-[11px] font-black tracking-wide">Ask SecureCloud AI</p>
                        <p className="text-gray-500 text-[9px] mt-0.5">Powered by Gemini 1.5 Flash</p>
                    </div>
                </motion.button>
            )}
        </div>
    );
};

export default Chatbot;
