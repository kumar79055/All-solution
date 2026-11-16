import React from 'react';
import { 
  Store, 
  ShoppingCart, 
  Package, 
  Truck, 
  History, 
  Settings, 
  AlertTriangle,
  PlusCircle,
  MessageCircle,
  UserCheck,
  Shield,
  HardHat,
  Crown,
  Scale,
  Smartphone
} from 'lucide-react';
import { ShopProfile, UserRole } from '../types';

interface HeaderProps {
  currentTab: 'cart' | 'products' | 'distributors' | 'history';
  setCurrentTab: (tab: 'cart' | 'products' | 'distributors' | 'history') => void;
  shopProfile: ShopProfile;
  cartItemCount: number;
  cartDistributorCount: number;
  lowStockCount: number;
  userRole: UserRole;
  onToggleUserRole: () => void;
  onOpenSettings: () => void;
  onOpenAddProduct: () => void;
  onOpenAddDistributor: () => void;
  onFilterLowStock: () => void;
  onOpenVoiceAssistant?: () => void;
  onOpenWeightCalculator?: () => void;
  onOpenShareModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  shopProfile,
  cartItemCount,
  cartDistributorCount,
  lowStockCount,
  userRole,
  onToggleUserRole,
  onOpenSettings,
  onOpenAddProduct,
  onOpenAddDistributor,
  onFilterLowStock,
  onOpenVoiceAssistant,
  onOpenWeightCalculator,
  onOpenShareModal
}) => {
  const isWorker = userRole === 'worker';
  return (
    <header className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-lg sticky top-0 z-40">
      {/* Top Bar with Shop Info & Actions */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md border-2 border-amber-300">
            <Store className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-xl tracking-tight leading-tight line-clamp-1">
                {shopProfile.shopName || 'किराना ऑर्डर साथी'}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-900/80 text-emerald-200 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                <MessageCircle className="w-3 h-3 text-emerald-400" />
                व्हाट्सएप ऑर्डर सिस्टम
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 flex items-center gap-2 line-clamp-1">
              <span>{shopProfile.ownerName ? `दुकानदार: ${shopProfile.ownerName}` : 'किराना स्टॉक व सप्लायर मैनेजर'}</span>
              {shopProfile.phone && <span>• 📞 {shopProfile.phone}</span>}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Worker / Malik Role Switcher */}
          <button
            onClick={onToggleUserRole}
            className={`flex items-center gap-1.5 text-xs px-2.5 sm:px-3 py-1.5 rounded-xl font-black transition ${
              isWorker 
                ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md ring-2 ring-amber-300' 
                : 'bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-400/40 text-emerald-100'
            }`}
            title={isWorker ? 'मालिक मोड में बदलें (सभी भाव व सेटिंग्स देखें)' : 'वर्कर मोड में बदलें (स्टाफ के लिए खरीद भाव छिपाएं)'}
          >
            {isWorker ? (
              <>
                <HardHat className="w-3.5 h-3.5 text-stone-950" />
                <span>👷 वर्कर मोड</span>
              </>
            ) : (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>👑 मालिक मोड</span>
              </>
            )}
          </button>

          {/* Voice Assistant Button */}
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-1.5 text-xs bg-amber-400 hover:bg-amber-300 text-stone-950 px-3 py-1.5 rounded-xl font-black shadow-md border-2 border-amber-300 transition transform active:scale-95"
              title="बोलकर सामान जोड़ें या खोजें"
            >
              <span className="text-sm">🎙️</span>
              <span className="hidden sm:inline">बोलकर जोड़ें</span>
            </button>
          )}

          {/* Weight & Rate Calculator Button */}
          {onOpenWeightCalculator && (
            <button
              onClick={onOpenWeightCalculator}
              className="flex items-center gap-1.5 text-xs bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-400/40 text-emerald-100 px-2 sm:px-3 py-1.5 rounded-xl font-bold transition shadow-xs"
              title="किराना तौल व भाव कैलकुलेटर (ग्राम, किलो, पाव, पेटी/बोरी)"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span className="sm:hidden font-bold">तौल</span>
              <span className="hidden sm:inline font-bold">तौल कैलकुलेटर</span>
            </button>
          )}

          {/* Mobile Login / Share Button */}
          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 text-xs bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-400/40 text-emerald-100 px-2 sm:px-3 py-1.5 rounded-xl font-bold transition shadow-xs"
              title="मोबाइल या दूसरे डिवाइस पर ऐप खोलें"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">फोन पर चलाएं</span>
            </button>
          )}

          {lowStockCount > 0 && (
            <button
              onClick={onFilterLowStock}
              className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 px-2.5 py-1.5 rounded-lg font-bold shadow transition"
              title="कम स्टॉक वाले सामान देखें"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-stone-950" />
              <span>{lowStockCount} कम</span>
            </button>
          )}

          {!isWorker && (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={onOpenAddProduct}
                className="flex items-center gap-1 text-xs bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-400/50 px-2.5 py-1.5 rounded-lg font-semibold transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ सामान जोड़ें</span>
              </button>
              <button
                onClick={onOpenAddDistributor}
                className="flex items-center gap-1 text-xs bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-400/50 px-2.5 py-1.5 rounded-lg font-semibold transition"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>+ डिस्ट्रीब्यूटर</span>
              </button>
            </div>
          )}

          {!isWorker && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 rounded-lg bg-emerald-800/80 hover:bg-emerald-600 border border-emerald-600/60 text-emerald-100 transition"
              title="दुकान सेटिंग"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-emerald-900/80 backdrop-blur border-t border-emerald-700/50">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2 py-1.5">
            <button
              onClick={() => setCurrentTab('cart')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                currentTab === 'cart'
                  ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-300'
                  : 'text-emerald-100 hover:bg-emerald-800/80 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>ऑर्डर पर्चा (Cart)</span>
              {cartItemCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.2 text-[11px] font-black rounded-full ${
                  currentTab === 'cart' ? 'bg-stone-950 text-amber-300' : 'bg-amber-400 text-stone-950'
                }`}>
                  {cartItemCount}
                </span>
              )}
              {cartDistributorCount > 0 && (
                <span className={`text-[10px] hidden sm:inline px-1.5 py-0.5 rounded ${
                  currentTab === 'cart' ? 'bg-stone-900/20 text-stone-900' : 'bg-emerald-950/70 text-emerald-200'
                }`}>
                  {cartDistributorCount} सप्लायर
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('products')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                currentTab === 'products'
                  ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-300'
                  : 'text-emerald-100 hover:bg-emerald-800/80 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>सामान व स्टॉक (Products)</span>
            </button>

            <button
              onClick={() => setCurrentTab('distributors')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                currentTab === 'distributors'
                  ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-300'
                  : 'text-emerald-100 hover:bg-emerald-800/80 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>डिस्ट्रीब्यूटर सूची (Distributors)</span>
            </button>

            <button
              onClick={() => setCurrentTab('history')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                currentTab === 'history'
                  ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-300'
                  : 'text-emerald-100 hover:bg-emerald-800/80 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>ऑर्डर रिकॉर्ड (History)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Worker Mode Alert Banner */}
      {isWorker && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 px-3 sm:px-6 py-2 text-xs font-bold shadow-md border-b border-amber-600/30">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-950 animate-pulse"></span>
              <HardHat className="w-4 h-4 text-stone-950 flex-shrink-0" />
              <span>
                <strong>👷 वर्कर मोड सक्रिय है:</strong> दुकान का लड़का/स्टाफ बिना खरीद भाव (Wholesale Rate) देखे शेल्फ देखकर सीधे पर्चा बना सकता है।
              </span>
            </div>
            <button
              onClick={onToggleUserRole}
              className="text-xs bg-stone-950 hover:bg-stone-800 text-amber-300 px-3 py-1 rounded-lg font-black transition flex items-center gap-1 shadow-sm ml-auto"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>मालिक मोड में बदलें</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
