import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Star, ShoppingBag, Sparkles, CheckCircle2, Shield, Heart, Droplets } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [addedNotice, setAddedNotice] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get('/api/products?limit=8'),
          axios.get('/api/products/meta/categories')
        ]);
        if (prodRes.data.success) {
          setFeaturedProducts(prodRes.data.products);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      } catch (err) {
        console.error('Home page fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedNotice(`Added "${product.name}" to your cart!`);
    setTimeout(() => setAddedNotice(null), 3000);
  };

  return (
    <div className="min-h-screen bg-ivory-100 dark:bg-[#09120e] text-stone-900 dark:text-stone-100 transition-colors duration-300">
      
      {/* Toast Notification */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-900 text-gold-300 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gold-500/40 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-gold-400" />
          <span className="text-sm font-semibold">{addedNotice}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white py-20 lg:py-28">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-800/80 border border-gold-500/30 text-gold-400 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% Handcrafted Ayurvedic Formulations</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ivory-50 leading-tight">
                Pure Nature, <br />
                <span className="text-gold-400 italic font-normal">Pure Care.</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Discover unadulterated botanical wellness ethically sourced from the biodiverse Western Ghats. From nutrient-dense cold-pressed hair oils to golden saffron serums.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <Link
                  to="/shop"
                  className="bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold px-7 py-3.5 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2 text-sm"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/explore"
                  className="bg-forest-800/60 hover:bg-forest-800 text-ivory-100 font-semibold px-7 py-3.5 rounded-full border border-forest-700 transition-colors text-sm"
                >
                  Our Brand Story
                </Link>
              </div>

              {/* Trust stats */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-forest-800 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-bold font-serif text-gold-400">100%</div>
                  <div className="text-xs text-stone-400">Pure Botanicals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-serif text-gold-400">18+</div>
                  <div className="text-xs text-stone-400">Sacred Herbs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-serif text-gold-400">12K+</div>
                  <div className="text-xs text-stone-400">Happy Patrons</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visuals */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Main Product Card Visual */}
                <div className="bg-forest-800/40 backdrop-blur-md p-4 rounded-3xl border border-gold-500/20 shadow-2xl">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-stone-900 group">
                    <img
                      src="/marketing/hero-signature-hair-oil.jpg"
                      alt="Veera Naturals Botanical Formulation"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1608248597359-005696120366?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-transparent to-transparent opacity-80" />
                    
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="bg-gold-500 text-forest-950 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                        Signature Product
                      </span>
                      <h3 className="font-serif text-xl font-bold mt-2">
                        Herbal Hair Growth Elixir
                      </h3>
                      <p className="text-xs text-stone-300">
                        Cold-pressed with 18 sacred Western Ghats herbs
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-gold-400 font-bold text-lg">₹349</span>
                        <Link
                          to="/shop"
                          className="text-xs font-semibold bg-white/20 hover:bg-white text-white hover:text-forest-900 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Discover
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Authentic Brand Seal */}
                <div className="absolute -top-5 -right-5 bg-forest-950/90 backdrop-blur-md text-ivory-100 p-3 rounded-2xl shadow-2xl border border-gold-500/40 hidden sm:flex items-center gap-3 animate-float">
                  <img src="/images/logo-emblem.png" alt="Veera Naturals Pure Botanical Seal" className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                  <div>
                    <p className="text-[11px] font-bold text-gold-400">Pure Botanical</p>
                    <p className="text-[10px] text-stone-300">100% Certified Herbs</p>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-[#15231c] text-forest-900 dark:text-gold-300 p-4 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 hidden sm:flex items-center gap-3 animate-float">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-forest-900 flex items-center justify-center text-forest-800 dark:text-gold-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-forest-900 dark:text-ivory-100">Zero Chemicals</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">Paraben &amp; Mineral Oil Free</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">Curated Botanicals</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900 dark:text-ivory-100 mt-2">
            Shop by Category
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm mt-3">
            Handcrafted natural treatments for targeted hair, skin, and body wellness.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Hair Care', slug: 'hair-care', icon: '💆', desc: 'Growth oils, shampoo bars, serums', count: '12 Items' },
            { name: 'Skin Care', slug: 'skin-care', icon: '✨', desc: 'Kumkumadi tailam, rose water', count: '18 Items' },
            { name: 'Body Care', slug: 'body-care', icon: '🧴', desc: 'Whipped shea butter, scrubs', count: '9 Items' },
            { name: 'Essential Oils', slug: 'essential-oils', icon: '🫧', desc: 'Steam-distilled pure oils', count: '7 Items' }
          ].map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className="group bg-white dark:bg-[#121e17] rounded-2xl p-6 text-center border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-xl hover:border-gold-500/50 transition-all hover:-translate-y-1.5"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-forest-50 dark:bg-forest-900/60 group-hover:bg-gold-50 dark:group-hover:bg-gold-950/40 transition-colors flex items-center justify-center text-3xl shadow-inner">
                {cat.icon}
              </div>
              <h3 className="font-serif text-lg font-bold text-forest-900 dark:text-ivory-100 group-hover:text-gold-700 dark:group-hover:text-gold-400 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 line-clamp-1">{cat.desc}</p>
              <span className="inline-block text-[11px] font-bold text-forest-800 dark:text-gold-400 group-hover:text-gold-600 mt-4 tracking-wide">
                Explore Collection →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="py-16 bg-white dark:bg-[#0a130f] border-y border-stone-200 dark:border-stone-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">Pure Formulations</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900 dark:text-ivory-100 mt-1">
                Featured Remedies
              </h2>
            </div>
            <Link
              to="/shop"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-forest-900 dark:text-gold-400 hover:text-gold-600 dark:hover:text-gold-300 transition-colors"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="group bg-ivory-50 dark:bg-[#121f18] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 hover:border-gold-500/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-900">
                  <img
                    src={product.images?.[0] || '/marketing/IMG-20260804-WA0013.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1608248597359-005696120366?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  {product.tags && product.tags[0] && (
                    <span className="absolute top-3 left-3 bg-forest-900 dark:bg-forest-950 text-gold-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow border border-gold-500/20">
                      {product.tags[0]}
                    </span>
                  )}
                  {product.stock <= 10 && product.stock > 0 && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Only {product.stock} Left
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold text-gold-700 dark:text-gold-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <Link
                      to={`/products/${product.slug || product.id}`}
                      className="block font-serif text-base font-bold text-forest-950 dark:text-ivory-100 hover:text-gold-700 dark:hover:text-gold-300 transition-colors mt-1"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1 font-light">
                      {product.description}
                    </p>
                  </div>

                  <div>
                    {/* Rating */}
                    <div className="flex items-center gap-1 text-amber-500 text-xs mb-2">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span className="font-bold text-stone-800 dark:text-stone-200">{product.rating || 4.8}</span>
                      <span className="text-stone-400">({product.numReviews || 24})</span>
                    </div>

                    {/* Price and Cart */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800">
                      <div>
                        <span className="text-lg font-bold text-forest-900 dark:text-gold-400">₹{product.price}</span>
                        {product.mrp && product.mrp > product.price && (
                          <span className="text-xs text-stone-400 line-through ml-2">₹{product.mrp}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-forest-900 dark:bg-forest-800 hover:bg-gold-500 dark:hover:bg-gold-500 text-white hover:text-forest-950 p-2.5 rounded-xl transition-all shadow hover:shadow-md"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Featured Marketing Campaign: Keshroot Organics Bio-Elixir */}
      <section className="py-20 bg-gradient-to-b from-white via-ivory-100 to-ivory-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-[#122b1e] rounded-3xl overflow-hidden border border-gold-500/30 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              
              {/* Campaign Image */}
              <div className="lg:col-span-7 relative group overflow-hidden bg-stone-900 flex items-center justify-center">
                <img 
                  src="/images/keshroot-campaign.jpg" 
                  alt="Keshroot Organics Bio-Elixir Scalp-First Nutrition" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-forest-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gold-500/50 text-gold-300 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  <span>Clinical Formulation</span>
                </div>
              </div>

              {/* Campaign Copy & Interactive CTA */}
              <div className="lg:col-span-5 p-8 sm:p-12 text-white space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/80 border border-gold-500/40 text-gold-400 text-xs font-bold tracking-widest uppercase">
                    <span>Rooted in Nature &bull; Backed by Science</span>
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl font-extrabold leading-tight text-ivory-50">
                    Unlock Your Hair's Potential: <br />
                    <span className="text-gold-400 italic font-normal">Scalp-First Nutrition</span>
                  </h3>
                </div>

                <p className="text-stone-300 text-sm leading-relaxed font-light">
                  Introducing <strong>Keshroot Organics Bio-Elixir</strong>. Powered by 18 cold-pressed botanical actives, golden saffron strands, and therapeutic scalp micro-nutrients. Fortifies weakened hair roots, balances sebum, and revitalizes follicles naturally.
                </p>

                {/* Key Pillars */}
                <div className="grid grid-cols-2 gap-3 text-xs text-ivory-200">
                  <div className="flex items-center gap-2.5 bg-forest-900/80 p-3 rounded-xl border border-forest-700/60">
                    <Droplets className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>Bio-Elixir Active Drop</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-forest-900/80 p-3 rounded-xl border border-forest-700/60">
                    <Shield className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>100% Scalp Safe</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-forest-900/80 p-3 rounded-xl border border-forest-700/60">
                    <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>Reduces Hair Fall</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-forest-900/80 p-3 rounded-xl border border-forest-700/60">
                    <Star className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>Save 20% Subscribe</span>
                  </div>
                </div>

                {/* Subscription & Shop CTA */}
                <div className="pt-2 flex flex-col sm:flex-row gap-4 sm:items-center">
                  <Link
                    to="/shop?category=hair-care"
                    className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-forest-950 font-bold px-7 py-3.5 rounded-full shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm"
                  >
                    <span>Activate Subscription &amp; Save 20%</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/shop?category=hair-care"
                    className="text-xs font-semibold text-center text-ivory-300 hover:text-gold-300 underline underline-offset-4 transition-colors"
                  >
                    Shop Hair Care Collection
                  </Link>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Brand Exploration Banner */}
      <section className="py-20 bg-forest-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Botanical Ethos</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
              Rooted in Ancient Wisdom, <br />
              Refined by Pure Science.
            </h2>
            <p className="text-stone-300 text-base leading-relaxed font-light">
              At Veera Naturals, every bottle is formulated using centuries-old Ayurvedic traditions. We reject fillers, parabens, sulphates, and synthetic perfumes, choosing instead to cold-press sacred herbs from independent organic farmers across Tamil Nadu and the Western Ghats.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-ivory-200">
                <CheckCircle2 className="w-5 h-5 text-gold-400" />
                <span>Single-origin cold-pressed oils preserving active bio-compounds</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-ivory-200">
                <CheckCircle2 className="w-5 h-5 text-gold-400" />
                <span>Steam-distilled flower hydrosols with zero added alcohol</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-ivory-200">
                <CheckCircle2 className="w-5 h-5 text-gold-400" />
                <span>Cruelty-free, zero-toxic formulations safe for everyday rituals</span>
              </div>
            </div>
            <div className="pt-4">
              <Link
                to="/explore"
                className="bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold px-8 py-3.5 rounded-full inline-flex items-center gap-2 shadow-lg transition-all"
              >
                <span>Read Full Brand Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="/marketing/1785836303830.png"
              alt="Veera Naturals Herb Processing"
              className="rounded-2xl shadow-xl object-cover h-64 w-full border border-forest-700"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80';
              }}
            />
            <img
              src="/marketing/1785833861474.png"
              alt="Veera Naturals Botanicals"
              className="rounded-2xl shadow-xl object-cover h-64 w-full mt-8 border border-forest-700"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1512290900672-1f486d3e75f7?w=600&auto=format&fit=crop&q=80';
              }}
            />
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">Real Experiences</span>
          <h2 className="font-serif text-3xl font-bold text-forest-900 dark:text-ivory-100 mt-1">
            Loved by Botanical Enthusiasts
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "The Veera Signature Herbal Hair Oil is unlike anything I've tried. Within 3 weeks my hair thinning reduced dramatically and my scalp feels deeply cooled.",
              author: "Priya S.",
              location: "Bengaluru",
              rating: 5,
              product: "Herbal Hair Oil"
            },
            {
              quote: "The Kashmiri Kumkumadi Serum gives this unbelievable natural radiance every morning without any sticky residue. Truly pure Ayurvedic gold in a bottle.",
              author: "Ananya M.",
              location: "Pune",
              rating: 5,
              product: "Kumkumadi Serum"
            },
            {
              quote: "Finding an authentic steam-distilled rose water that doesn't reek of artificial fragrance was impossible until Veera Naturals. It feels like pure mountain air.",
              author: "Rahul V.",
              location: "Chennai",
              rating: 5,
              product: "Pure Rose Water"
            }
          ].map((t, idx) => (
            <div key={idx} className="bg-white dark:bg-[#121e17] p-7 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-500 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-stone-700 dark:text-stone-300 text-sm italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-forest-900 dark:text-ivory-100">{t.author}</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{t.location}</p>
                </div>
                <span className="text-[11px] font-semibold text-gold-700 dark:text-gold-300 bg-gold-50 dark:bg-gold-950/60 border border-gold-500/20 px-2.5 py-1 rounded-full">
                  {t.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
