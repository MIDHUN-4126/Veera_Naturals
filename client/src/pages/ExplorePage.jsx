import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Sparkles, Heart, Shield, Compass, ArrowRight, CheckCircle2, User, LogIn, Droplets, Sun, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ExplorePage() {
  const { isAuthenticated, user } = useAuth();
  const [selectedConcerns, setSelectedConcerns] = useState('hair');

  const recommendations = {
    hair: [
      { name: 'Veera Signature Herbal Hair Oil', role: 'Hair Fall & Root Strengthening', price: '₹349', icon: '🌿', link: '/shop?category=hair-care' },
      { name: 'Veera Wild Hibiscus Shampoo Bar', role: 'Zero SLS Cleansing & Scalp Health', price: '₹249', icon: '🌺', link: '/shop?category=hair-care' }
    ],
    skin: [
      { name: 'Veera Golden Kumkumadi Glow Serum', role: 'Overnight Luminous Complexion & Spot Reduction', price: '₹699', icon: '✨', link: '/shop?category=skin-care' },
      { name: 'Veera Pure Kannauj Rose Water', role: 'Instant Pore Tightening & Natural Hydrosol', price: '₹299', icon: '🌹', link: '/shop?category=skin-care' }
    ],
    body: [
      { name: 'Veera Shea & Cocoa Deep Nourish Body Butter', role: '48h Intense Winter Hydration Barrier', price: '₹449', icon: '🧴', link: '/shop?category=body-care' },
      { name: 'Veera Arabica Espresso & Coconut Scrub', role: 'Cellulite Polish & Silky Skin Finish', price: '₹379', icon: '☕', link: '/shop?category=body-care' }
    ],
    aromatherapy: [
      { name: 'Veera Pure Himalayan Lavender Oil', role: 'Deep Restful Sleep & Stress Reduction', price: '₹499', icon: '💜', link: '/shop?category=essential-oils' },
      { name: 'Veera Sweet Orange Mood Booster Oil', role: 'Mental Clarity & Ambient Air Purification', price: '₹389', icon: '🍊', link: '/shop?category=essential-oils' }
    ]
  };

  return (
    <div className="min-h-screen bg-ivory-100 text-stone-900">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-forest-950 via-forest-900 to-forest-850 text-white py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/80 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5" />
            <span>Discover The Essence of Veera Naturals</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-tight text-ivory-50">
            Rooted in Earth. <br />
            <span className="text-gold-400 italic">Formulated with Reverence.</span>
          </h1>

          <p className="text-stone-300 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Welcome to the sanctuary of pure botanical care. Learn about our heritage, sustainable wildcrafting, and explore authentic Ayurvedic remedies crafted for modern life.
          </p>

          {/* Quick Login/Signup Prompt for Guests */}
          {!isAuthenticated ? (
            <div className="pt-6 inline-flex flex-wrap items-center justify-center gap-3 bg-forest-800/50 backdrop-blur border border-gold-500/20 px-6 py-3 rounded-2xl max-w-md mx-auto">
              <span className="text-xs text-ivory-200">Already a botanical patron?</span>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 underline underline-offset-4"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign in to your account
              </Link>
              <span className="text-xs text-stone-400">or</span>
              <Link
                to="/signup"
                className="text-xs font-bold bg-gold-500 text-forest-950 px-3 py-1 rounded-full hover:bg-gold-600 transition-colors"
              >
                Join Free
              </Link>
            </div>
          ) : (
            <div className="pt-6 inline-flex items-center gap-2 text-xs text-gold-400 bg-forest-800/40 px-4 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>Signed in as <strong>{user.name}</strong> ({user.email})</span>
            </div>
          )}
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600">The Genesis</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest-950 leading-tight">
              Why We Founded <br />
              <span className="text-forest-800">Veera Naturals</span>
            </h2>

            <p className="text-stone-700 leading-relaxed text-base font-light">
              Modern personal care had become obsessed with synthetic shortcuts: mineral oils pretending to be hair tonics, petrochemical fragrances masquerading as floral extracts, and plastic bottles littering the planet.
            </p>

            <p className="text-stone-700 leading-relaxed text-base font-light">
              Veera Naturals was born out of a simple, rebellious belief: <strong>Nature does not require synthetic improvements.</strong> In the verdant foothills of the Western Ghats in Tamil Nadu, we partnered with smallholder organic farmers who still harvest herbs according to seasonal lunar cycles and cold-press seeds on traditional wood churns.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <Sun className="w-6 h-6 text-gold-600 mb-2" />
                <h4 className="font-serif font-bold text-forest-900 text-base">Wood-Churned Cold Pressing</h4>
                <p className="text-xs text-stone-500 mt-1">Extracted below 38°C to retain all natural flavonoids and vitamins.</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <Droplets className="w-6 h-6 text-gold-600 mb-2" />
                <h4 className="font-serif font-bold text-forest-900 text-base">Zero Dilution Policy</h4>
                <p className="text-xs text-stone-500 mt-1">Never diluted with paraffin, cheap light mineral oil, or alcohol.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="/marketing/image1.png"
                alt="Veera Naturals Brand Experience"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-forest-900 text-gold-300 p-6 rounded-2xl shadow-xl max-w-xs border border-gold-500/30 hidden sm:block">
              <p className="font-serif text-lg font-bold">100% Ethical Transparency</p>
              <p className="text-xs text-stone-300 mt-1">Every ingredient is disclosed with full botanical binomial nomenclature.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Botanical Remedy Selector */}
      <section className="py-16 bg-forest-950 text-white border-y border-forest-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Interactive Guide</span>
            <h2 className="font-serif text-3xl font-bold mt-1 text-ivory-100">
              Find Your Personalized Botanical Remedy
            </h2>
            <p className="text-stone-400 text-sm mt-2">
              Select your primary wellness focus to view targeted natural formulations:
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { id: 'hair', label: '💆 Hair Growth & Scalp', cat: 'Hair Care' },
              { id: 'skin', label: '✨ Radiance & Glow', cat: 'Skin Care' },
              { id: 'body', label: '🧴 Moisture Barrier', cat: 'Body Care' },
              { id: 'aromatherapy', label: '🫧 Sleep & Aromatherapy', cat: 'Essential Oils' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedConcerns(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  selectedConcerns === tab.id
                    ? 'bg-gold-500 text-forest-950 shadow-lg scale-105'
                    : 'bg-forest-900 text-stone-300 hover:bg-forest-850 border border-forest-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filtered Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations[selectedConcerns].map((rec, i) => (
              <div
                key={i}
                className="bg-forest-900/90 rounded-2xl p-6 border border-gold-500/20 shadow-lg flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl p-3 bg-forest-800 rounded-xl">{rec.icon}</span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ivory-100">{rec.name}</h3>
                    <p className="text-xs text-gold-300 font-medium">{rec.role}</p>
                    <span className="text-sm font-bold text-white mt-1 inline-block">{rec.price}</span>
                  </div>
                </div>
                <Link
                  to={rec.link}
                  className="bg-gold-500 hover:bg-gold-600 text-forest-950 text-xs font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-gold-400 hover:text-gold-300"
            >
              <span>Explore Complete Product Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Four Sacred Botanical Pillars */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Our Standards</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900 mt-2">
            The Veera Purity Standard
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-7 rounded-2xl border border-stone-200 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-emerald-50 rounded-2xl flex items-center justify-center text-forest-800">
              <Leaf className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-forest-900 text-lg">Single Origin</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Every herb is traced back to accredited certified growers in the Western Ghats and Kannauj valleys.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-stone-200 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-gold-50 rounded-2xl flex items-center justify-center text-gold-600">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-forest-900 text-lg">Small Batch Brews</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Crafted in small batches under strict temperature controls to ensure optimal potency.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-stone-200 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-emerald-50 rounded-2xl flex items-center justify-center text-forest-800">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-forest-900 text-lg">Zero Toxic Preservatives</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Preserved using natural tocopherol (Vitamin E) and botanical essential oils, not synthetic parabens.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-stone-200 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-gold-50 rounded-2xl flex items-center justify-center text-gold-600">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-forest-900 text-lg">Eco-Conscious Packaging</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Housed in amber UV-protective glass and compostable outer cartons to protect our earth.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="bg-gold-500 text-forest-950 py-14 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="font-serif text-3xl font-extrabold">Ready to Experience Pure Botanical Care?</h2>
          <p className="text-sm font-medium opacity-90 max-w-xl mx-auto">
            Join thousands of patrons embracing authentic wellness. Browse our catalogue or create your personalized account today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link
              to="/shop"
              className="bg-forest-900 hover:bg-forest-950 text-white font-bold px-8 py-3.5 rounded-full text-sm shadow-md transition-all"
            >
              Shop All Products
            </Link>
            {!isAuthenticated && (
              <Link
                to="/signup"
                className="bg-white hover:bg-stone-100 text-forest-950 font-bold px-8 py-3.5 rounded-full text-sm shadow-md transition-all"
              >
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
