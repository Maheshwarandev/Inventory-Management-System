import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Loader2, Boxes, ClipboardList, Warehouse } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5efe6] dark:bg-slate-950 flex">
            <div className="hidden lg:flex lg:w-[46%] bg-[#1f2a24] text-[#f8efe2] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_45%)]" />
                <div className="relative z-10 flex flex-col justify-between p-10 lg:p-14">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#f8efe2] text-[#1f2a24] flex items-center justify-center shadow-sm">
                            <Warehouse className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold tracking-tight">IMS Ledger</p>
                            <p className="text-sm text-[#c7c0b4]">Stockroom operations</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-[#a7b29c] mb-4">Receiving · Dispatch · Inventory</p>
                        <h1 className="text-4xl font-semibold leading-tight mb-4">Run the warehouse from one calm control panel.</h1>
                        <p className="text-lg text-[#d8d0c0] max-w-md">Keep shelves, purchase orders, invoices, and stock movements in sync without the usual dashboard noise.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                        <div className="rounded-xl bg-[#f8efe2] text-[#1f2a24] p-3">
                            <div className="flex items-center gap-2 text-sm font-semibold"><Boxes className="w-4 h-4" /> Live stock</div>
                            <p className="text-2xl font-semibold mt-2">{/* dynamic by DB soon */}24/7</p>
                        </div>
                        <div className="rounded-xl bg-[#f8efe2] text-[#1f2a24] p-3">
                            <div className="flex items-center gap-2 text-sm font-semibold"><ClipboardList className="w-4 h-4" /> Orders</div>
                            <p className="text-2xl font-semibold mt-2">Tracked</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-sm rounded-3xl border border-[#e4dccf] dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(31,42,36,0.08)] backdrop-blur">
                    <div className="lg:hidden flex items-center gap-2.5 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-[#1f2a24] text-[#f8efe2] flex items-center justify-center">
                            <Warehouse className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">IMS Ledger</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Sign in to the stockroom</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Use your staff credentials to open the warehouse dashboard.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    autoComplete="username"
                                    data-lpignore="true"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="employee@ims.com"
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-[#f9f6ef] dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1f2a24]/10 focus:border-[#1f2a24] transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="off"
                                    data-lpignore="true"
                                    data-form-type="other"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-[#f9f6ef] dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1f2a24]/10 focus:border-[#1f2a24] transition-all placeholder:text-slate-400"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-[#1f2a24] hover:bg-[#27372f] text-[#f8efe2] font-medium py-2.6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
