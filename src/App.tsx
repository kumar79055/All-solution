/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Distributor, 
  Product, 
  CartItem, 
  OrderRecord, 
  ShopProfile,
  UserRole 
} from './types';
import { Storage } from './utils/storage';
import { Header } from './components/Header';
import { CartCheckout } from './components/CartCheckout';
import { ProductList } from './components/ProductList';
import { DistributorList } from './components/DistributorList';
import { OrderHistory } from './components/OrderHistory';
import { ProductModal } from './components/ProductModal';
import { DistributorModal } from './components/DistributorModal';
import { OrderSlipModal } from './components/OrderSlipModal';
import { ShopSettingsModal } from './components/ShopSettingsModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { WeightCalculatorModal } from './components/WeightCalculatorModal';
import { PinModal } from './components/PinModal';
import { ShareAppModal } from './components/ShareAppModal';
import { CheckCircle2, MessageCircle, AlertTriangle, Sparkles, Mic, Scale, Smartphone } from 'lucide-react';

export default function App() {
  // App Core States
  const [distributors, setDistributors] = useState<Distributor[]>(() => Storage.getDistributors());
  const [products, setProducts] = useState<Product[]>(() => Storage.getProducts());
  const [cart, setCart] = useState<CartItem[]>(() => Storage.getCart());
  const [orders, setOrders] = useState<OrderRecord[]>(() => Storage.getOrderHistory());
  const [shopProfile, setShopProfile] = useState<ShopProfile>(() => Storage.getShopProfile());
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      return (localStorage.getItem('kirana_user_role_v1') as UserRole) || 'malik';
    } catch {
      return 'malik';
    }
  });

  // PIN Protection State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const handleToggleUserRole = () => {
    if (userRole === 'malik') {
      // Malik can freely switch to worker mode to hand phone to helper
      setUserRole('worker');
      try {
        localStorage.setItem('kirana_user_role_v1', 'worker');
      } catch {}
      showToast('👷 वर्कर मोड चालू हो गया (खरीद भाव छिपा दिया गया)');
    } else {
      // Switching from Worker to Malik mode REQUIRES SECRET PIN!
      setIsPinModalOpen(true);
    }
  };

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'cart' | 'products' | 'distributors' | 'history'>('products');
  const [initialFilterLowStock, setInitialFilterLowStock] = useState<boolean>(false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState<string>('');

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isWeightCalcOpen, setIsWeightCalcOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [defaultProductDistId, setDefaultProductDistId] = useState<string | undefined>(undefined);

  const [isDistributorModalOpen, setIsDistributorModalOpen] = useState(false);
  const [distributorToEdit, setDistributorToEdit] = useState<Distributor | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [printSlipState, setPrintSlipState] = useState<{
    isOpen: boolean;
    distributor: Distributor | null;
    items: CartItem[];
    customNote?: string;
  }>({
    isOpen: false,
    distributor: null,
    items: [],
    customNote: ''
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Sync state changes with Storage
  useEffect(() => {
    Storage.saveDistributors(distributors);
  }, [distributors]);

  useEffect(() => {
    Storage.saveProducts(products);
  }, [products]);

  useEffect(() => {
    Storage.saveCart(cart);
  }, [cart]);

  useEffect(() => {
    Storage.saveOrderHistory(orders);
  }, [orders]);

  useEffect(() => {
    Storage.saveShopProfile(shopProfile);
  }, [shopProfile]);

  // Derived calculations
  const lowStockCount = useMemo(() => {
    return products.filter(p => p.currentStock <= p.minStockAlert).length;
  }, [products]);

  const cartDistributorCount = useMemo(() => {
    const set = new Set<string>();
    cart.forEach(item => set.add(item.distributorId));
    return set.size;
  }, [cart]);

  // Cart operations
  const handleAddToCart = (product: Product, qty: number = 1) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.productId === product.id);
      if (existingIndex >= 0) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty
        };
        return updated;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          productName: product.name,
          distributorId: product.distributorId,
          quantity: qty,
          unit: product.unit,
          wholesalePrice: product.wholesalePrice,
          mrp: product.mrp
        };
        return [...prevCart, newItem];
      }
    });
    showToast(`"${product.name}" पर्चे में जोड़ा गया!`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity } : item));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleClearCart = () => {
    if (window.confirm('क्या आप पूरा ऑर्डर पर्चा खाली करना चाहते हैं?')) {
      setCart([]);
      showToast('पर्चा खाली कर दिया गया।');
    }
  };

  const handleClearDistributorItems = (distributorId: string) => {
    setCart(prev => prev.filter(item => item.distributorId !== distributorId));
    showToast('इस डिस्ट्रीब्यूटर का सामान पर्चे से हटा दिया गया।');
  };

  const handleAddCustomItemToDistributor = (
    distributorId: string, 
    item: { name: string; quantity: number; unit: string; price: number }
  ) => {
    const customItem: CartItem = {
      productId: `custom-${Date.now()}`,
      productName: item.name,
      distributorId: distributorId,
      quantity: item.quantity,
      unit: item.unit,
      wholesalePrice: item.price,
      isCustomItem: true
    };
    setCart(prev => [...prev, customItem]);
    showToast(`"${item.name}" पर्चे में जोड़ दिया गया!`);
  };

  const handleAddAllLowStockToCart = () => {
    const lowStockItems = products.filter(p => p.currentStock <= p.minStockAlert);
    if (lowStockItems.length === 0) {
      showToast('दुकान में कोई भी सामान कम स्टॉक में नहीं है!');
      return;
    }

    setCart(prevCart => {
      const updated = [...prevCart];
      lowStockItems.forEach(prod => {
        const existingIdx = updated.findIndex(i => i.productId === prod.id);
        const neededQty = Math.max(1, (prod.minStockAlert * 2) - prod.currentStock);
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: Math.max(updated[existingIdx].quantity, neededQty)
          };
        } else {
          updated.push({
            productId: prod.id,
            productName: prod.name,
            distributorId: prod.distributorId,
            quantity: neededQty,
            unit: prod.unit,
            wholesalePrice: prod.wholesalePrice,
            mrp: prod.mrp
          });
        }
      });
      return updated;
    });

    showToast(`${lowStockItems.length} कम स्टॉक वाले सामान पर्चे में जुड़ गए!`);
    setCurrentTab('cart');
  };

  // Mark order as placed
  const handleMarkAsOrdered = (
    distributor: Distributor, 
    items: CartItem[], 
    customNote?: string,
    recipientInfo?: { recipientType: 'distributor' | 'salesman' | 'both'; recipientName?: string; recipientPhone?: string }
  ) => {
    const totalAmount = items.reduce(
      (sum, item) => sum + (item.wholesalePrice > 0 ? item.wholesalePrice * item.quantity : 0),
      0
    );

    const isSalesman = recipientInfo?.recipientType === 'salesman';
    const targetName = recipientInfo?.recipientName || (isSalesman ? (distributor.salesmanName || 'सेल्समैन') : distributor.name);
    const targetPhone = recipientInfo?.recipientPhone || (isSalesman ? (distributor.salesmanPhone || distributor.whatsappNumber) : distributor.whatsappNumber);

    const orderRecord: OrderRecord = {
      id: `ord-${Date.now()}`,
      orderNumber: String(Math.floor(1000 + Math.random() * 9000)),
      distributorId: distributor.id,
      distributorName: distributor.name,
      distributorPhone: distributor.whatsappNumber,
      companyName: distributor.companyName,
      items: items.map(i => ({
        name: i.productName,
        quantity: i.quantity,
        unit: i.unit,
        price: i.wholesalePrice,
        total: i.wholesalePrice > 0 ? i.wholesalePrice * i.quantity : 0
      })),
      totalAmount,
      status: 'sent',
      sentAt: new Date().toISOString(),
      customNote,
      recipientType: recipientInfo?.recipientType || 'distributor',
      recipientName: targetName,
      recipientPhone: targetPhone
    };

    setOrders(prev => [orderRecord, ...prev]);

    // Remove ordered items of this distributor from active cart
    setCart(prev => prev.filter(item => item.distributorId !== distributor.id));
    const recipientLabel = isSalesman ? `सेल्समैन (${targetName})` : `डिस्ट्रीब्यूटर (${distributor.name})`;
    showToast(`✅ ${recipientLabel} का ऑर्डर दर्ज हो गया!`);
  };

  const handleReorder = (order: OrderRecord) => {
    const newItems: CartItem[] = order.items.map(i => ({
      productId: `reorder-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productName: i.name,
      distributorId: order.distributorId,
      quantity: i.quantity,
      unit: i.unit,
      wholesalePrice: i.price
    }));

    setCart(prev => [...prev, ...newItems]);
    showToast(`${order.distributorName} का पुराना ऑर्डर दोबारा कार्ट में जुड़ गया!`);
    setCurrentTab('cart');
  };

  // Product CRUD
  const handleSaveProduct = (product: Product) => {
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = product;
        return copy;
      }
      return [product, ...prev];
    });
    showToast(`"${product.name}" सेव हो गया!`);
  };

  const handleDeleteProduct = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (window.confirm(`क्या आप "${prod?.name || 'यह सामान'}" को दुकान की लिस्ट से हटाना चाहते हैं?`)) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setCart(prev => prev.filter(i => i.productId !== productId));
      showToast('सामान हटा दिया गया।');
    }
  };

  // Distributor CRUD
  const handleSaveDistributor = (distributor: Distributor) => {
    setDistributors(prev => {
      const idx = prev.findIndex(d => d.id === distributor.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = distributor;
        return copy;
      }
      return [distributor, ...prev];
    });
    showToast(`डिस्ट्रीब्यूटर "${distributor.name}" सेव हो गया!`);
  };

  const handleDeleteDistributor = (distributorId: string) => {
    const dist = distributors.find(d => d.id === distributorId);
    const linkedProducts = products.filter(p => p.distributorId === distributorId);
    
    const confirmMsg = linkedProducts.length > 0 
      ? `इस डिस्ट्रीब्यूटर के ${linkedProducts.length} सामान लिस्ट में हैं। क्या आप डिस्ट्रीब्यूटर को हटाना चाहते हैं?`
      : `क्या आप "${dist?.name || 'यह डिस्ट्रीब्यूटर'}" को हटाना चाहते हैं?`;

    if (window.confirm(confirmMsg)) {
      setDistributors(prev => prev.filter(d => d.id !== distributorId));
      showToast('डिस्ट्रीब्यूटर हटा दिया गया।');
    }
  };

  const handleResetData = () => {
    Storage.resetToDefaultData();
    setDistributors(Storage.getDistributors());
    setProducts(Storage.getProducts());
    setShopProfile(Storage.getShopProfile());
    setCart([]);
    showToast('डेमो डेटा पुनः लोड कर दिया गया!');
  };

  const handleDataImported = () => {
    setDistributors(Storage.getDistributors());
    setProducts(Storage.getProducts());
    setShopProfile(Storage.getShopProfile());
    setOrders(Storage.getOrderHistory());
    setCart(Storage.getCart());
    showToast('बैकअप सफलतापूर्वक बहाल हो गया!');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans flex flex-col selection:bg-emerald-200">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setInitialFilterLowStock(false);
        }}
        shopProfile={shopProfile}
        cartItemCount={cart.length}
        cartDistributorCount={cartDistributorCount}
        lowStockCount={lowStockCount}
        userRole={userRole}
        onToggleUserRole={handleToggleUserRole}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAddProduct={() => {
          setProductToEdit(null);
          setDefaultProductDistId(undefined);
          setIsProductModalOpen(true);
        }}
        onOpenAddDistributor={() => {
          setDistributorToEdit(null);
          setIsDistributorModalOpen(true);
        }}
        onFilterLowStock={() => {
          setCurrentTab('products');
          setInitialFilterLowStock(true);
        }}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
        onOpenWeightCalculator={() => setIsWeightCalcOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-5 sm:py-6">
        {currentTab === 'cart' && (
          <CartCheckout
            cart={cart}
            distributors={distributors}
            shopProfile={shopProfile}
            userRole={userRole}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onClearDistributorItems={handleClearDistributorItems}
            onMarkAsOrdered={handleMarkAsOrdered}
            onOpenPrintSlip={(distributor, items, customNote) => {
              setPrintSlipState({
                isOpen: true,
                distributor,
                items,
                customNote
              });
            }}
            onAddCustomItemToDistributor={handleAddCustomItemToDistributor}
            onNavigateToProducts={() => setCurrentTab('products')}
          />
        )}

        {currentTab === 'products' && (
          <ProductList
            products={products}
            distributors={distributors}
            cart={cart}
            userRole={userRole}
            onAddToCart={handleAddToCart}
            onEditProduct={(p) => {
              setProductToEdit(p);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onAddAllLowStockToCart={handleAddAllLowStockToCart}
            onOpenAddProduct={() => {
              setProductToEdit(null);
              setDefaultProductDistId(undefined);
              setIsProductModalOpen(true);
            }}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            initialFilterLowStock={initialFilterLowStock}
            externalSearchQuery={voiceSearchQuery}
          />
        )}

        {currentTab === 'distributors' && (
          <DistributorList
            distributors={distributors}
            products={products}
            onOpenAddDistributor={() => {
              setDistributorToEdit(null);
              setIsDistributorModalOpen(true);
            }}
            onEditDistributor={(d) => {
              setDistributorToEdit(d);
              setIsDistributorModalOpen(true);
            }}
            onDeleteDistributor={handleDeleteDistributor}
            onViewDistributorProducts={(distId) => {
              setCurrentTab('products');
            }}
          />
        )}

        {currentTab === 'history' && (
          <OrderHistory
            orders={orders}
            onUpdateOrderStatus={(orderId, status) => {
              setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
              showToast('ऑर्डर स्टेटस अपडेट हो गया!');
            }}
            onDeleteOrder={(orderId) => {
              if (window.confirm('क्या आप यह पुराना ऑर्डर हटाना चाहते हैं?')) {
                setOrders(prev => prev.filter(o => o.id !== orderId));
                showToast('ऑर्डर रिकॉर्ड हटा दिया गया।');
              }
            }}
            onClearHistory={() => {
              if (window.confirm('क्या आप पूरा ऑर्डर इतिहास साफ करना चाहते हैं?')) {
                setOrders([]);
                showToast('ऑर्डर इतिहास साफ हो गया।');
              }
            }}
            onReorder={handleReorder}
          />
        )}
      </main>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        distributors={distributors}
        productToEdit={productToEdit}
        defaultDistributorId={defaultProductDistId}
      />

      <DistributorModal
        isOpen={isDistributorModalOpen}
        onClose={() => setIsDistributorModalOpen(false)}
        onSave={handleSaveDistributor}
        distributorToEdit={distributorToEdit}
      />

      <OrderSlipModal
        isOpen={printSlipState.isOpen}
        onClose={() => setPrintSlipState(prev => ({ ...prev, isOpen: false }))}
        distributor={printSlipState.distributor}
        items={printSlipState.items}
        shopProfile={shopProfile}
        customNote={printSlipState.customNote}
      />

      <ShopSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        shopProfile={shopProfile}
        onSaveProfile={(profile) => {
          setShopProfile(profile);
          showToast('दुकान की जानकारी अपडेट हो गई!');
        }}
        onResetData={handleResetData}
        onDataImported={handleDataImported}
      />

      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        products={products}
        distributors={distributors}
        onAddToCart={(product, qty, customUnit) => {
          handleAddToCart(product, qty);
          showToast(`"${product.name}" (${qty} ${customUnit || product.unit}) पर्चे में जोड़ दिया गया!`);
          setCurrentTab('cart');
        }}
        onSearch={(term) => {
          setVoiceSearchQuery(term);
          setCurrentTab('products');
          showToast(`"${term}" खोजा जा रहा है...`);
        }}
        onAddNewProductWithName={(name, qty, unit) => {
          setProductToEdit({
            id: '',
            name,
            hindiName: '',
            distributorId: distributors[0]?.id || '',
            category: 'जनरल किराना',
            currentStock: 0,
            minStockAlert: 2,
            unit: unit || 'पेटी (Carton/Box)',
            wholesalePrice: 0,
            mrp: 0,
            updatedAt: ''
          });
          setIsProductModalOpen(true);
        }}
      />

      <WeightCalculatorModal
        isOpen={isWeightCalcOpen}
        onClose={() => setIsWeightCalcOpen(false)}
      />

      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        correctPin={shopProfile.ownerPin || '1234'}
        onSuccess={() => {
          setUserRole('malik');
          try {
            localStorage.setItem('kirana_user_role_v1', 'malik');
          } catch {}
          showToast('👑 मालिक मोड अनलॉक हो गया! (सभी खरीद भाव और सेटिंग्स चालू)');
        }}
      />

      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        appUrl={typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-mrugqyepf5sfhjllykbd2f-652479634211.asia-southeast1.run.app'}
        sharedAppUrl="https://ais-pre-mrugqyepf5sfhjllykbd2f-652479634211.asia-southeast1.run.app"
      />

      {/* Floating Action Buttons Group (Desktop & Tablet) */}
      <div className="fixed bottom-6 right-6 z-30 hidden sm:flex flex-col items-end gap-2.5">
        {/* Floating Weight Calculator Button */}
        <button
          onClick={() => setIsWeightCalcOpen(true)}
          className="flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-900 font-bold px-3.5 py-2.5 rounded-2xl shadow-lg border border-stone-300 transition transform hover:scale-105 active:scale-95"
          title="किराना तौल व भाव कैलकुलेटर (ग्राम, किलो, पाव)"
        >
          <div className="w-7 h-7 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <span className="text-xs font-black">⚖️ तौल कैलकुलेटर</span>
        </button>

        {/* Floating Voice Assistant Button */}
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black px-4 py-3 rounded-2xl shadow-xl border-2 border-amber-300 transition transform hover:scale-105 active:scale-95"
          title="बोलकर सामान जोड़ें या खोजें"
        >
          <div className="w-8 h-8 rounded-xl bg-stone-950 text-amber-400 flex items-center justify-center">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left">
            <div className="text-[10px] text-stone-800 uppercase tracking-wider font-extrabold leading-none">आवाज़ से ऑर्डर</div>
            <div className="text-xs font-black text-stone-950 leading-tight">बोलकर जोड़ें / खोजें</div>
          </div>
        </button>
      </div>

      {/* Quick Mobile Cart Floating Bar when on Products/Distributors tab and cart has items */}
      {currentTab !== 'cart' && cart.length > 0 && (
        <div className="fixed bottom-4 left-3 right-3 sm:hidden z-30">
          <button
            onClick={() => setCurrentTab('cart')}
            className="w-full bg-stone-900 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border-2 border-amber-400 active:scale-98 transition"
          >
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 font-black flex items-center justify-center text-xs">
                {cart.length}
              </span>
              <span className="text-xs font-bold text-stone-200">
                {cartDistributorCount} डिस्ट्रीब्यूटर का पर्चा तैयार
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
              <span>व्हाट्सएप चेकआउट</span>
              <span>→</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
