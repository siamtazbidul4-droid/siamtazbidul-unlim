import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCartUniqueLinesCount } from '../../features/cart/cartSlice';
import { selectWishlistCount } from '../../features/wishlist/wishlistSlice';
import { AccountPopup } from './AccountPopup';
import {
  Search,
  User,
  Heart,
  ShoppingCart,
  Menu,
  ChevronDown,
  X,
  Truck,
  RotateCcw,
  ShieldCheck,
  Phone,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { apiRequest } from '../../services/api';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartUniqueCount = useAppSelector(selectCartUniqueLinesCount);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch categories for "All Categories ▾" dropdown
  useEffect(() => {
    apiRequest('/categories').then((res) => {
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    });
  }, []);

  // Debounced search suggestions query
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      apiRequest(`/products/suggestions?q=${encodeURIComponent(searchQuery)}`).then((res) => {
        if (res.success && res.suggestions) {
          setSuggestions(res.suggestions);
          setShowSuggestions(true);
        }
      });
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search container to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${slug}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-100">
      {/* 1. Subtle Micro Announcement Strip (Compact, 28px) */}
      <div className="bg-[#051329] text-white text-[11px] py-1 px-4 sm:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-6 text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-blue-300 font-medium">
              <Truck className="w-3.5 h-3.5 shrink-0 text-blue-400" />
              <span>Free Shipping on Orders Over ৳1,000</span>
            </span>
            <span className="hidden md:inline text-slate-500">·</span>
            <span className="hidden md:flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Genuine Brand Warranty</span>
            </span>
            <span className="hidden lg:inline text-slate-500">·</span>
            <span className="hidden lg:flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span>30 Days Easy Return</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 shrink-0">
            <a
              href="tel:+8801234567890"
              className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-blue-400" />
              <span>+880 1234 567890</span>
            </a>
            <Link
              to="/admin"
              className="text-[10px] font-bold text-blue-300 hover:text-white bg-blue-500/15 hover:bg-blue-500/25 px-2 py-0.5 rounded-md transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Header (Clean, balanced, modern luxury e-commerce layout) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4 sm:gap-8">
        {/* Left Section: Brand Logo & Identity */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-700 leading-none block">
                Aurelia
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 tracking-wider uppercase block">
                Shop Smart, Live Better
              </span>
            </div>
          </Link>
        </div>

        {/* Center Section: Integrated Responsive Search Bar */}
        <div ref={searchContainerRef} className="flex-1 max-w-2xl relative hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Search smartphones, noise-cancelling earbuds, ultrabooks..."
              className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
            />
            <button
              type="submit"
              className="absolute right-1.5 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
              aria-label="Submit search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto">
              <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Matching Catalog Results
              </div>
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSuggestionClick(item.slug)}
                  className="px-3.5 py-2 hover:bg-blue-50/60 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-b-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0 border border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-blue-700 tabular-nums">
                        ৳{item.price.toLocaleString()}
                      </span>
                      {item.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through tabular-nums">
                          ৳{item.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Icon-Only Action Controls (Clean, Uncluttered, Functional) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Account Icon / Avatar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="p-1 sm:p-1.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all relative cursor-pointer group flex items-center gap-1.5"
              aria-label="User Account"
              title={isAuthenticated ? `Logged in as ${user?.name}` : 'My Account'}
            >
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-blue-600/30 group-hover:ring-blue-600 transition-all"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                      title="Authenticated session active"
                    />
                  </div>
                  <span className="hidden xl:inline text-xs font-bold text-slate-700 max-w-[85px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <div className="p-1">
                  <User className="w-5 h-5 transition-transform group-hover:scale-105" />
                </div>
              )}
            </button>
            <AccountPopup isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
          </div>

          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            className="p-2.5 text-slate-700 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors relative group"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart className="w-5 h-5 transition-transform group-hover:scale-105" />
            {wishlistCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs tabular-nums">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors relative group"
            aria-label="Shopping Cart"
            title="Cart"
          >
            <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-105" />
            {cartUniqueCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs tabular-nums">
                {cartUniqueCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile search bar when collapsed */}
      <div className="px-4 pb-3 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog products..."
            className="w-full pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-blue-600"
          />
          <button
            type="submit"
            className="absolute right-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 3. Compact Navigation Menu Bar (Single compact tier, no duplicate Home/Shop/Categories) */}
      <div className="bg-[#0b1f3f] text-white hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center">
            {/* "All Categories ▾" dropdown button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 flex items-center gap-2 transition-colors uppercase tracking-wider cursor-pointer"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>All Categories</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {isCategoryMenuOpen && (
                <div
                  onMouseLeave={() => setIsCategoryMenuOpen(false)}
                  className="absolute left-0 top-full w-60 bg-white text-slate-800 rounded-b-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100"
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat._id || cat.slug}
                      to={`/shop?category=${cat.slug}`}
                      onClick={() => setIsCategoryMenuOpen(false)}
                      className="px-4 py-2 hover:bg-blue-50 text-xs font-medium text-slate-700 hover:text-blue-700 flex items-center justify-between transition-colors"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-slate-400">({cat.liveCount || cat.itemCount || 10}+)</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Direct category & collection links (zero repetition) */}
            <nav className="flex items-center text-xs font-medium">
              <Link
                to="/shop"
                className="py-2.5 px-4 text-slate-200 hover:text-white hover:bg-white/10 transition-colors font-semibold"
              >
                Shop All
              </Link>
              <Link
                to="/shop?category=mobile-tablets"
                className="py-2.5 px-3.5 text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                Smartphones
              </Link>
              <Link
                to="/shop?category=electronics"
                className="py-2.5 px-3.5 text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                Audio & Sound
              </Link>
              <Link
                to="/shop?category=computer-accessories"
                className="py-2.5 px-3.5 text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                Laptops & Computing
              </Link>
              <Link
                to="/shop?sort=newest"
                className="py-2.5 px-3.5 text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                New Arrivals
              </Link>
              <Link
                to="/shop?sort=discount"
                className="py-2.5 px-3.5 text-amber-300 hover:text-amber-200 hover:bg-white/10 transition-colors font-semibold"
              >
                Special Offers ⚡
              </Link>
              <Link
                to="/contact"
                className="py-2.5 px-3.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Support
              </Link>
            </nav>
          </div>

          <div className="flex items-center text-[11px] text-slate-300">
            <span>Fast Nationwide Delivery</span>
          </div>
        </div>
      </div>

      {/* 4. Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Popular Categories
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat._id || cat.slug}
                  to={`/shop?category=${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition truncate"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
            <Link
              to="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-blue-600 hover:underline"
            >
              Browse Full Catalog →
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-500 hover:text-slate-800"
            >
              Customer Support
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
