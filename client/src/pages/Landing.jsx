import { Link } from 'react-router-dom';
import { Shield, Lock, Activity, Globe, Server, Cpu, ChevronRight } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-background text-white overflow-hidden relative selection:bg-primary/30">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-purple-600/10 rounded-full blur-[80px]"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>
            </div>

            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-primary" />
                    <span className="text-xl font-bold tracking-wider">CloudShield</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Log In</Link>
                    <Link to="/register" className="px-5 py-2 bg-primary hover:bg-primaryHover text-black font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-700 text-xs font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    Now with CP-ABE & Parallel Processing
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    Secure Data Outsourcing <br />
                    <span className="text-primary">Reimagined for the Cloud.</span>
                </h1>

                <p className="max-w-2xl text-lg text-gray-400 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    Experience the next generation of cloud security.
                    Combining <span className="text-white">AES-256-GCM</span> speed with <span className="text-white">Attribute-Based Encryption</span> for granular access control.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                    <Link to="/register" className="px-8 py-4 bg-primary text-black font-bold rounded-xl text-lg flex items-center gap-2 hover:bg-primaryHover transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                        Start Securing Now <ChevronRight size={20} />
                    </Link>
                    <Link to="/login" className="px-8 py-4 bg-gray-900/50 border border-gray-700 text-white font-bold rounded-xl text-lg hover:bg-gray-800 transition-all backdrop-blur-md">
                        View Demo
                    </Link>
                </div>

                {/* Cyberpunk Stats */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 w-full border-t border-gray-800 pt-10 animate-in fade-in duration-1000 delay-500">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-white font-mono">256-bit</span>
                        <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Encryption</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-primary font-mono">CP-ABE</span>
                        <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Access Control</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-success font-mono">99.9%</span>
                        <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Uptime</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-warning font-mono">&lt;50ms</span>
                        <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Latency</span>
                    </div>
                </div>
            </main>

            {/* Features Grid */}
            <section className="bg-surface/30 border-y border-gray-800 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-8 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Advanced Security Architecture</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Built on the principles of parallel processing and cryptographic agility.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Lock}
                            title="Attribute-Based Encryption"
                            desc="Define complex access policies (e.g., 'Manager AND IT_Dept') embedded directly into the ciphertext."
                        />
                        <FeatureCard
                            icon={Cpu}
                            title="Parallel Processing"
                            desc="Split-then-Encrypt architecture utilizing multi-threaded workers for high-throughput uploads."
                        />
                        <FeatureCard
                            icon={Activity}
                            title="Real-time Auditing"
                            desc="Immutable audit logs track every key access, decryption attempt, and configuration change."
                        />
                        <FeatureCard
                            icon={Server}
                            title="Distributed Storage"
                            desc="Data chunks are distributed across virtual nodes with redundancy and failure recovery."
                        />
                        <FeatureCard
                            icon={Globe}
                            title="Zero-Knowledge"
                            desc="We never store your master keys in plaintext. Your data remains yours, always."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Threat Detection"
                            desc="AI-powered analysis scans file metadata for potential anomalies before encryption."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm">
                <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <Shield size={16} />
                    <span>© 2026 SecureCloud Research Project</span>
                </div>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-primary transition-colors">Documentation</a>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-primary/50 transition-all hover:bg-gray-900 group">
        <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Icon size={24} className="text-primary" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
);

export default Landing;
