import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const res = await register(name, email, password, phone);
    setLoading(false);

    if (res.success) {
      navigate('/profile');
    } else {
      setError(res.message);
    }
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
              Begin Your Botanical Journey.
            </h2>
            <p className="text-xs text-stone-300 font-light leading-relaxed">
              Create an account to save shipping addresses, track your cold-pressed wellness deliveries, and earn botanical points.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-forest-800 text-xs text-stone-300 font-light">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <span>10% OFF Welcome Coupon on First Order</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <span>Priority dispatch on seasonal herb batches</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <span>Encrypted & secure customer dashboard</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-forest-950">
              Create Account
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Join the Veera Naturals botanical community
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 text-xs p-3 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold uppercase text-stone-600 tracking-wider block mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full text-xs p-3 pl-10 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

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
                  placeholder="aarav@example.com"
                  className="w-full text-xs p-3 pl-10 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-stone-600 tracking-wider block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs p-3 pl-10 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-stone-600 tracking-wider block mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full text-xs p-3 pl-10 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-stone-600 tracking-wider block mb-1">
                  Confirm
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm"
                    className="w-full text-xs p-3 pl-10 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-900 hover:bg-forest-950 text-gold-400 font-bold py-3.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Join Veera Naturals'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-stone-100 text-center text-xs text-stone-500">
            <span>Already have an account? </span>
            <Link to="/login" className="font-bold text-forest-900 hover:text-gold-600">
              Sign in
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
