import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else if (redirect === 'checkout') {
        navigate('/checkout');
      } else {
        navigate('/profile');
      }
    } else {
      setError(res.message);
    }
  };

  const fillAdmin = () => {
    setEmail('admin@veeranaturals.com');
    setPassword('Admin@Veera2026');
    setError(null);
  };

  const fillCustomer = () => {
    setEmail('customer@veeranaturals.com');
    setPassword('Customer@123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Botanical Banner */}
        <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-forest-850 p-8 sm:p-12 text-white flex flex-col justify-between relative">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/images/logo-emblem.png" alt="Veera Naturals" className="h-11 w-auto object-contain filter drop-shadow" onError={(e) => { e.target.src = '/marketing/image3.png'; }} />
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold text-gold-400">Veera Naturals</span>
                <span className="text-[9px] tracking-[0.22em] text-ivory-200 uppercase font-sans font-semibold">Pure Botanical Wellness</span>
              </div>
            </div>
            <h2 className="font-serif text-3xl font-extrabold leading-tight text-ivory-50 pt-4">
              Return to Pure Nature.
            </h2>
            <p className="text-xs text-stone-300 font-light leading-relaxed">
              Access your personalized botanical rituals, track hand-crafted orders, and enjoy member rewards.
            </p>
          </div>

          {/* Quick Demo Credentials Fillers */}
          <div className="bg-forest-800/60 p-4 rounded-2xl border border-gold-500/20 space-y-2.5 mt-8">
            <div className="flex items-center gap-1.5 text-gold-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Demo Login</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillAdmin}
                className="bg-gold-500 hover:bg-gold-600 text-forest-950 text-xs font-bold py-2 px-2.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 shadow"
              >
                <span>Admin Portal</span>
              </button>
              <button
                type="button"
                onClick={fillCustomer}
                className="bg-forest-900 hover:bg-forest-700 text-gold-300 text-xs font-bold py-2 px-2.5 rounded-lg border border-gold-500/30 transition-all text-center flex items-center justify-center gap-1"
              >
                <span>Customer</span>
              </button>
            </div>
            <p className="text-[10px] text-stone-400 text-center font-light">
              Click to autofill credentials for testing
            </p>
          </div>
        </div>

        {/* Right Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-forest-950">
              Welcome Back
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Please enter your credentials to access your account
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 text-xs p-3 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-stone-600 tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@veeranaturals.com"
                  className="w-full text-xs p-3 pl-10 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500 font-medium"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase text-stone-600 tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-stone-400 cursor-pointer hover:underline">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs p-3 pl-10 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-900 hover:bg-forest-950 text-gold-400 font-bold py-3.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
            <span>New to Veera Naturals? </span>
            <Link to="/signup" className="font-bold text-forest-900 hover:text-gold-600">
              Create an account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
