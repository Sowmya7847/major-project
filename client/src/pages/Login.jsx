import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Shield, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="min-h-screen bg-background bg-grid-pattern flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {/* Glow Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-primary blur-[4px]"></div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-surfaceHover rounded-xl flex items-center justify-center mb-4 border border-gray-700 shadow-inner">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Secure Access Portal</h1>
                    <p className="text-gray-400 text-sm mt-2 text-center">
                        Enter your credentials to access the distributed cloud environment.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg flex items-center gap-2">
                        <Shield size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Work Email</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="email"
                                className="w-full pl-10 pr-3 py-2.5 bg-background border border-gray-700 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-white transition-all placeholder-gray-600"
                                placeholder="user@enterprise.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                            <a href="#" className="text-xs text-primary hover:text-primaryHover transition-colors">Forgot password?</a>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full pl-10 pr-10 py-2.5 bg-background border border-gray-700 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-white transition-all placeholder-gray-600"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input id="remember" type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-background text-primary focus:ring-offset-gray-900 focus:ring-primary cursor-pointer" />
                        <label htmlFor="remember" className="ml-2 text-sm text-gray-400 cursor-pointer select-none">Remember this device for 30 days</label>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2.5 bg-primary hover:bg-primaryHover text-black font-bold rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        Sign In <ArrowRight size={18} />
                    </button>
                </form>

                <div className="mt-8 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-surface px-2 text-gray-500">Or sign in with</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center px-4 py-2 border border-gray-700 rounded-lg hover:bg-surfaceHover transition-colors text-sm text-gray-300 gap-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-yellow-500"></div> Google
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 border border-gray-700 rounded-lg hover:bg-surfaceHover transition-colors text-sm text-gray-300 gap-2">
                        <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                            <div className="bg-red-500 text-[0px]">.</div>
                            <div className="bg-green-500 text-[0px]">.</div>
                            <div className="bg-blue-500 text-[0px]">.</div>
                            <div className="bg-yellow-500 text-[0px]">.</div>
                        </div> Microsoft
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-xs">
                        Don't have an account? <Link to="/register" className="text-primary hover:underline">Register Access</Link>
                    </p>
                    <p className="text-gray-600 text-[10px] mt-4 uppercase tracking-widest">
                        Protected by Distributed Cloud Shield v2.4
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
