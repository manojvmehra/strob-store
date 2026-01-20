import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckSquare, Square, ShieldCheck } from 'lucide-react';

const Login = ({ onLoginSuccess, isDarkMode }) => {
    const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            // Redirect handled by OAuth
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                // Pass rememberMe if we were to act on it. 
                // Currently AuthContext/Service does standard persistence.
                await signInWithEmail(formData.email, formData.password);
                if (onLoginSuccess) onLoginSuccess();
            } else {
                await signUpWithEmail(formData.email, formData.password, formData.fullName);
                // For Supabase, usually auto-logs if no confirm email needed or returns session.
                if (onLoginSuccess) onLoginSuccess();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 py-20 ${isDarkMode ? 'bg-[#0e0e10]' : 'bg-[#f4f4f5]'}`}>
            <div className={`w-full max-w-md p-8 rounded-xl border shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>

                {/* DECORATIVE BACKGROUND */}
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <ShieldCheck className={`h-32 w-32 ${isDarkMode ? 'text-white' : 'text-black'}`} />
                </div>

                {/* HEADER */}
                <div className="text-center mb-8 relative z-10">
                    <h2 className={`font-mono-tech text-3xl font-bold uppercase mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        {isLogin ? 'Secure_Login' : 'New_Identity'}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                        {isLogin ? 'Authenticate to access personalized features.' : 'Initialize profile for guest-to-user sync.'}
                    </p>
                </div>

                {/* GOOGLE BUTTON */}
                <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border transition-all mb-6 group ${isDarkMode
                        ? 'border-white/20 hover:bg-white hover:text-black text-white'
                        : 'border-black/20 hover:bg-black hover:text-white text-black'
                        }`}
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    <span className="font-mono-tech font-bold text-sm">
                        {loading ? 'CONNECTING...' : 'CONTINUE WITH GOOGLE'}
                    </span>
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className={`w-full border-t ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className={`px-2 font-mono-tech ${isDarkMode ? 'bg-[#0e0e10] text-white/30' : 'bg-[#f4f4f5] text-black/30'}`}>
                            Or continue with email
                        </span>
                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className={`text-xs font-bold font-mono-tech ml-1 ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>FULL NAME</label>
                            <div className="relative">
                                <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`} />
                                <input
                                    type="text"
                                    name="fullName"
                                    required={!isLogin}
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={`w-full bg-transparent border rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF4D4D] transition-all ${isDarkMode
                                        ? 'border-white/10 text-white placeholder-white/20'
                                        : 'border-black/10 text-black placeholder-black/20'
                                        }`}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className={`text-xs font-bold font-mono-tech ml-1 ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>EMAIL ADDRESS</label>
                        <div className="relative">
                            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`} />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full bg-transparent border rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF4D4D] transition-all ${isDarkMode
                                    ? 'border-white/10 text-white placeholder-white/20'
                                    : 'border-black/10 text-black placeholder-black/20'
                                    }`}
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className={`text-xs font-bold font-mono-tech ml-1 ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>PASSWORD</label>
                        <div className="relative">
                            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full bg-transparent border rounded-lg py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF4D4D] transition-all ${isDarkMode
                                    ? 'border-white/10 text-white placeholder-white/20'
                                    : 'border-black/10 text-black placeholder-black/20'
                                    }`}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {isLogin && (
                        <div className="flex items-center justify-between text-xs">
                            <button
                                type="button"
                                onClick={() => setRememberMe(!rememberMe)}
                                className={`flex items-center gap-2 ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'}`}
                            >
                                {rememberMe ? <CheckSquare className="h-4 w-4 text-[#FF4D4D]" /> : <Square className="h-4 w-4 opacity-50" />}
                                Remember me
                            </button>
                            <button type="button" className="opacity-50 hover:opacity-100 hover:underline">
                                Forgot password?
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono flex items-start gap-2 animate-pulse">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-industrial bg-[#FF4D4D] hover:bg-[#ff3333] text-black font-bold py-3 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'ACCESS SYSTEM' : 'CREATE ACCOUNT'}
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* TOGGLE */}
                <div className="mt-6 text-center">
                    <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 font-bold text-[#FF4D4D] hover:underline font-mono-tech"
                        >
                            {isLogin ? 'JOIN NOW' : 'SIGN IN'}
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;
