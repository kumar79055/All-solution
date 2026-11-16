import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Distributor, CartItem, UserRole } from '../types';
import { 
  Search, 
  Plus, 
  ShoppingCart, 
  AlertTriangle, 
  Check, 
  Edit3, 
  Trash2, 
  Filter, 
  Truck, 
  Sparkles, 
  Layers, 
  Mic, 
  MicOff,
  Lock,
  HardHat
} from 'lucide-react';

interface ProductListProps {
  products: Product[];
  distributors: Distributor[];
  cart: CartItem[];
  userRole?: UserRole;
  onAddToCart: (product: Product, quantity?: number) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddAllLowStockToCart: () => void;
  onOpenAddProduct: () => void;
  onOpenVoiceModal?: () => void;
  initialFilterLowStock?: boolean;
  externalSearchQuery?: string;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  distributors,
  cart,
  userRole = 'malik',
  onAddToCart,
  onEditProduct,
  onDeleteProduct,
  onAddAllLowStockToCart,
  onOpenAddProduct,
  onOpenVoiceModal,
  initialFilterLowStock = false,
  externalSearchQuery = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [selectedDistributorId, setSelectedDistributorId] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(initialFilterLowStock);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const searchRecognitionRef = useRef<any>(null);

  useEffect(() => {
    if (externalSearchQuery) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('ब्राउज़र में आवाज़ पहचान समर्थित नहीं है।');
      return;
    }

    try {
      if (searchRecognitionRef.current) {
        searchRecognitionRef.current.abort();
      }

      const rec = new SpeechRecognition();
      rec.lang = 'hi-IN';
      rec.continuous = false;
      rec.interimResults = true;

      rec.onstart = () => setIsVoiceSearching(true);
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        // Clean common search suffixes
        const clean = text.replace(/(सर्च|खोजो|दिखाओ|search|find)/gi, '').trim();
        setSearchQuery(clean || text);
      };
      rec.onerror = () => setIsVoiceSearching(false);
      rec.onend = () => setIsVoiceSearching(false);

      searchRecognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error(err);
      setIsVoiceSearching(false);
    }
  };

  const stopVoiceSearch = () => {
    if (searchRecognitionRef.current) {
      searchRecognitionRef.current.abort();
    }
    setIsVoiceSearching(false);
  };

  // Map distributors for fast lookup
  const distributorMap = useMemo(() => {
    const map = new Map<string, Distributor>();
    distributors.forEach(d => map.set(d.id, d));
    return map;
  }, [distributors]);

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Cart item count lookup
  const cartQuantityMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach(item => {
      map.set(item.productId, (map.get(item.productId) || 0) + item.quantity);
    });
    return map;
  }, [cart]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search text in name, hindiName, category, notes
      const matchSearch = searchQuery.trim() === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.hindiName && p.hindiName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      // Distributor filter
      const matchDist = selectedDistributorId === 'all' || p.distributorId === selectedDistributorId;

      // Category filter
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;

      // Low stock filter
      const isLowStock = p.currentStock <= p.minStockAlert;
      const matchLowStock = !onlyLowStock || isLowStock;

      return matchSearch && matchDist && matchCat && matchLowStock;
    });
  }, [products, searchQuery, selectedDistributorId, selectedCategory, onlyLowStock]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.currentStock <= p.minStockAlert).length;
  }, [products]);

  const handleQuickAdd = (product: Product, qty: number = 1) => {
    onAddToCart(product, qty);
    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-16">
      {/* Top Banner / Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-5 mb-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-700" />
              <span>दुकान का सामान व इन्वेंट्री (Products & Stock)</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              कुल {products.length} सामान दर्ज हैं। डिस्ट्रीब्यूटर अनुसार फ़िल्टर करें और जिसे मंगाना हो उसे एक क्लिक में पर्चे में जोड़ें।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenVoiceModal && (
              <button
                onClick={onOpenVoiceModal}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition active:scale-95 border border-amber-300"
                title="बोलकर सामान जोड़ें या खोजें"
              >
                <Mic className="w-4 h-4 text-stone-950" />
                <span>🎙️ बोलकर जोड़ें</span>
              </button>
            )}

            {lowStockCount > 0 && (
              <button
                onClick={onAddAllLowStockToCart}
                className="flex items-center gap-1.5 bg-stone-100 hover:bg-amber-100 text-stone-800 font-bold px-3 py-2 rounded-xl text-xs sm:text-sm border border-stone-200 transition"
                title="सभी कम स्टॉक वाले आइटम कार्ट में डालें"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>कम स्टॉक ({lowStockCount})</span>
              </button>
            )}

            <button
              onClick={onOpenAddProduct}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ नया सामान जोड़ें</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Search box with Voice Mic button */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isVoiceSearching ? 'सुन रहे हैं... सामान का नाम बोलिए...' : 'सामान खोजें (उदा: Parle-G, तेल, चीनी, आटा)...'}
              className={`w-full text-xs sm:text-sm bg-stone-50 border rounded-xl pl-9 pr-16 py-2.5 text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-stone-400 transition ${
                isVoiceSearching ? 'border-red-400 ring-2 ring-red-200 bg-red-50/30' : 'border-stone-200'
              }`}
            />
            
            <div className="absolute right-2.5 top-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-stone-400 hover:text-stone-700 px-1"
                >
                  ✕
                </button>
              )}

              {/* Voice search mic button */}
              <button
                onClick={isVoiceSearching ? stopVoiceSearch : startVoiceSearch}
                className={`p-1 rounded-lg transition ${
                  isVoiceSearching 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'text-stone-400 hover:text-emerald-700 hover:bg-stone-100'
                }`}
                title={isVoiceSearching ? 'माइक बंद करें' : 'बोलकर खोजें'}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Distributor Filter */}
          <div className="sm:col-span-4">
            <select
              value={selectedDistributorId}
              onChange={(e) => setSelectedDistributorId(e.target.value)}
              className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">🚚 सभी डिस्ट्रीब्यूटर (All Suppliers)</option>
              {distributors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.companyName || d.category})
                </option>
              ))}
            </select>
          </div>

          {/* Low Stock Toggle Button */}
          <div className="sm:col-span-3">
            <button
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition border ${
                onlyLowStock
                  ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${onlyLowStock ? 'text-stone-950' : 'text-amber-500'}`} />
              <span>कम स्टॉक वाले ({lowStockCount})</span>
            </button>
          </div>
        </div>

        {/* Quick Category Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1 flex-shrink-0 mr-1">
              <Filter className="w-3 h-3" />
              कैटेगरी:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              सभी ({products.length})
            </button>
            {categories.map(cat => {
              const count = products.filter(p => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-800 mb-1">कोई सामान नहीं मिला</h3>
          <p className="text-xs sm:text-sm text-stone-500 mb-4">
            आपके चुने गए फ़िल्टर या सर्च के अनुसार कोई आइटम उपलब्ध नहीं है।
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDistributorId('all');
              setSelectedCategory('all');
              setOnlyLowStock(false);
            }}
            className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-lg transition"
          >
            सभी फ़िल्टर हटाएं
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredProducts.map(product => {
            const dist = distributorMap.get(product.distributorId);
            const isLowStock = product.currentStock <= product.minStockAlert;
            const inCartQty = cartQuantityMap.get(product.id) || 0;
            const isJustAdded = recentlyAddedId === product.id;

            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between ${
                  isLowStock ? 'border-amber-300 ring-1 ring-amber-200/60 bg-amber-50/20' : 'border-stone-200'
                }`}
              >
                <div>
                  {/* Top line: Category & Stock badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md truncate max-w-[160px]">
                      {product.category || 'जनरल किराना'}
                    </span>

                    {isLowStock ? (
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        कम स्टॉक ({product.currentStock} {product.unit.split(' ')[0]})
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        स्टॉक: {product.currentStock} {product.unit.split(' ')[0]}
                      </span>
                    )}
                  </div>

                  {/* Product Title */}
                  <div className="mb-2">
                    <h3 className="font-extrabold text-stone-900 text-base leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    {product.hindiName && product.hindiName !== product.name && (
                      <p className="text-xs text-stone-500 font-medium line-clamp-1">
                        {product.hindiName}
                      </p>
                    )}
                  </div>

                  {/* Distributor Info Tag */}
                  <div className="bg-stone-50 rounded-xl p-2.5 mb-3 border border-stone-150">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                      <Truck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{dist ? dist.name : 'डिस्ट्रीब्यूटर नहीं'}</span>
                    </div>
                    {dist && dist.whatsappNumber && (
                      <div className="text-[11px] text-stone-500 mt-0.5 ml-5 font-mono">
                        व्हाट्सएप: {dist.whatsappNumber}
                      </div>
                    )}
                  </div>

                  {/* Pricing & Units */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-stone-50/50 p-2 rounded-lg border border-stone-100">
                    <div>
                      <span className="text-stone-500 text-[11px] block">खरीद भाव (दर):</span>
                      {userRole === 'worker' ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded mt-0.5">
                          <Lock className="w-3 h-3 text-amber-700" />
                          <span>गुप्त (मालिक)</span>
                        </div>
                      ) : (
                        <>
                          <strong className="text-stone-900 font-black text-sm">
                            ₹{product.wholesalePrice > 0 ? product.wholesalePrice : '—'}
                          </strong>
                          <span className="text-[10px] text-stone-500">/{product.unit.split(' ')[0]}</span>
                        </>
                      )}
                    </div>
                    <div>
                      <span className="text-stone-500 text-[11px] block">बिक्री दर (MRP):</span>
                      <strong className="text-stone-700 font-bold text-sm">
                        ₹{product.mrp > 0 ? product.mrp : '—'}
                      </strong>
                    </div>
                  </div>

                  {product.notes && (
                    <p className="text-[11px] text-stone-500 italic mb-3 line-clamp-1">
                      नोट: {product.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  {userRole !== 'worker' ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition"
                        title="सामान बदलें"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="सामान हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-stone-500 font-bold">
                      <HardHat className="w-3.5 h-3.5 text-amber-600" />
                      <span>स्टाफ मोड</span>
                    </div>
                  )}

                  {/* Quick Add To Cart Button */}
                  <div className="flex items-center gap-1.5">
                    {inCartQty > 0 && (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg">
                        पर्चे में: {inCartQty}
                      </span>
                    )}

                    {userRole === 'worker' && (
                      <button
                        onClick={() => handleQuickAdd(product, 5)}
                        className="text-xs font-bold px-2 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition"
                        title="+5 जोड़ें"
                      >
                        +5
                      </button>
                    )}

                    <button
                      onClick={() => handleQuickAdd(product, 1)}
                      className={`text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95 ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>जुड़ गया!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>+ {userRole === 'worker' ? 'पर्चा' : 'पर्चे में डालें'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
