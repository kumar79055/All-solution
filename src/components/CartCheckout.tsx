import React, { useState } from 'react';
import { 
  CartItem, 
  Distributor, 
  ShopProfile, 
  DistributorOrderGroup,
  UnitType,
  UserRole 
} from '../types';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  MessageCircle, 
  Printer, 
  Copy, 
  Check, 
  AlertCircle,
  Truck,
  PlusCircle,
  Send,
  Building2,
  Phone,
  FileText,
  Lock,
  UserCheck
} from 'lucide-react';
import { generateWhatsAppOrderMessage, createWhatsAppUrl } from '../utils/whatsapp';

interface CartCheckoutProps {
  cart: CartItem[];
  distributors: Distributor[];
  shopProfile: ShopProfile;
  userRole?: UserRole;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onClearDistributorItems: (distributorId: string) => void;
  onMarkAsOrdered: (
    distributor: Distributor, 
    items: CartItem[], 
    customNote?: string,
    recipientInfo?: { recipientType: 'distributor' | 'salesman' | 'both'; recipientName?: string; recipientPhone?: string }
  ) => void;
  onOpenPrintSlip: (distributor: Distributor, items: CartItem[], customNote?: string) => void;
  onAddCustomItemToDistributor: (distributorId: string, item: { name: string; quantity: number; unit: string; price: number }) => void;
  onNavigateToProducts: () => void;
}

export const CartCheckout: React.FC<CartCheckoutProps> = ({
  cart,
  distributors,
  shopProfile,
  userRole = 'malik',
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onClearDistributorItems,
  onMarkAsOrdered,
  onOpenPrintSlip,
  onAddCustomItemToDistributor,
  onNavigateToProducts
}) => {
  const [copiedDistributorId, setCopiedDistributorId] = useState<string | null>(null);
  const [customNotes, setCustomNotes] = useState<Record<string, string>>({});
  const [recipientChoice, setRecipientChoice] = useState<Record<string, 'distributor' | 'salesman'>>({});
  const [showAddCustomModal, setShowAddCustomModal] = useState<string | null>(null);
  const [customItemForm, setCustomItemForm] = useState({
    name: '',
    quantity: 1,
    unit: 'पेटी (Carton/Box)' as UnitType,
    price: 0
  });

  // Group items by Distributor
  const distributorMap = new Map<string, Distributor>();
  distributors.forEach(d => distributorMap.set(d.id, d));

  const groups: DistributorOrderGroup[] = [];
  const distributorItemsMap = new Map<string, CartItem[]>();

  cart.forEach(item => {
    const list = distributorItemsMap.get(item.distributorId) || [];
    list.push(item);
    distributorItemsMap.set(item.distributorId, list);
  });

  distributorItemsMap.forEach((items, distId) => {
    const dist = distributorMap.get(distId) || {
      id: distId,
      name: 'अज्ञात डिस्ट्रीब्यूटर (Unknown)',
      companyName: 'जनरल सप्लायर',
      whatsappNumber: '919876543210',
      category: 'सामान्य',
      createdAt: ''
    };

    const subtotal = items.reduce(
      (sum, itm) => sum + (itm.wholesalePrice > 0 ? itm.wholesalePrice * itm.quantity : 0),
      0
    );

    groups.push({
      distributor: dist,
      items,
      subtotal,
      itemCount: items.length,
      customDistributorNote: customNotes[dist.id] || shopProfile.defaultOrderMessage || ''
    });
  });

  const totalCartAmount = groups.reduce((acc, g) => acc + g.subtotal, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCopyMessage = (group: DistributorOrderGroup, targetRecipient: 'distributor' | 'salesman' = 'distributor') => {
    const note = customNotes[group.distributor.id] || shopProfile.defaultOrderMessage;
    const isSalesman = targetRecipient === 'salesman' && Boolean(group.distributor.salesmanPhone);
    const msg = generateWhatsAppOrderMessage({
      distributor: group.distributor,
      items: group.items,
      shopProfile,
      customNote: note,
      targetRecipient: isSalesman ? 'salesman' : 'distributor'
    });

    navigator.clipboard.writeText(msg).then(() => {
      setCopiedDistributorId(group.distributor.id);
      setTimeout(() => setCopiedDistributorId(null), 2500);
    });
  };

  const handleSendWhatsApp = (group: DistributorOrderGroup, targetRecipient: 'distributor' | 'salesman' = 'distributor') => {
    const note = customNotes[group.distributor.id] || shopProfile.defaultOrderMessage;
    const dist = group.distributor;
    const isSalesman = targetRecipient === 'salesman' && Boolean(dist.salesmanPhone);
    const targetPhone = isSalesman ? dist.salesmanPhone! : dist.whatsappNumber;
    const targetName = isSalesman ? (dist.salesmanName || 'सेल्समैन') : dist.name;

    const msg = generateWhatsAppOrderMessage({
      distributor: dist,
      items: group.items,
      shopProfile,
      customNote: note,
      targetRecipient: isSalesman ? 'salesman' : 'distributor'
    });

    const url = createWhatsAppUrl(targetPhone, msg);
    window.open(url, '_blank');

    // Also auto prompt or record order history
    onMarkAsOrdered(dist, group.items, note, {
      recipientType: isSalesman ? 'salesman' : 'distributor',
      recipientName: targetName,
      recipientPhone: targetPhone
    });
  };

  const handleAddCustomSubmit = (distributorId: string) => {
    if (!customItemForm.name.trim()) return;
    onAddCustomItemToDistributor(distributorId, {
      name: customItemForm.name.trim(),
      quantity: Number(customItemForm.quantity) || 1,
      unit: customItemForm.unit,
      price: Number(customItemForm.price) || 0
    });
    setCustomItemForm({
      name: '',
      quantity: 1,
      unit: 'पेटी (Carton/Box)',
      price: 0
    });
    setShowAddCustomModal(null);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <ShoppingCart className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h2 className="text-2xl font-black text-stone-800 mb-2">आपका ऑर्डर पर्चा खाली है</h2>
        <p className="text-stone-600 max-w-md mx-auto mb-6 text-sm">
          दुकान के जिस-जिस सामान का स्टॉक खत्म या कम हो गया है, उन्हें कार्ट में जोड़ें। ऐप अपने आप डिस्ट्रीब्यूटर अनुसार अलग-अलग व्हाट्सएप पर्चा तैयार कर देगा!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onNavigateToProducts}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl shadow-md transition"
          >
            <PlusCircle className="w-5 h-5" />
            <span>सामान सूची देखें और जोड़ें (Browse Products)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-16 px-3 sm:px-4">
      {/* Top Summary Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                ऑर्डर पर्चा व व्हाट्सएप चेकआउट
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              आपके कार्ट में <strong className="text-emerald-700">{cart.length} प्रकार के सामान</strong> हैं, जो <strong className="text-emerald-700">{groups.length} अलग-अलग डिस्ट्रीब्यूटर्स</strong> में बंटे हुए हैं।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-stone-500 font-medium">
                {userRole === 'malik' ? 'कुल अनुमानित बजट' : 'कुल सामान मात्रा'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-800">
                {userRole === 'malik' ? `₹${totalCartAmount.toLocaleString('en-IN')}` : `${totalItemsCount} नग`}
              </div>
            </div>
            <button
              onClick={onClearCart}
              className="text-xs flex items-center gap-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-lg font-semibold transition"
              title="पूरा कार्ट खाली करें"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>पर्चा खाली करें</span>
            </button>
          </div>
        </div>

        {/* Info Tip */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-start gap-2 text-xs text-stone-600 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
          <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>कैसे काम करता है:</strong> नीचे हर डिस्ट्रीब्यूटर का अपना अलग बॉक्स है। हरा बटन <strong>"व्हाट्सएप पर भेजें"</strong> दबाते ही उस डिस्ट्रीब्यूटर का पर्चा उनके नंबर पर खुल जाएगा!
          </span>
        </div>
      </div>

      {/* Distributor-Wise Groups */}
      <div className="space-y-6">
        {groups.map((group, groupIdx) => {
          const dist = group.distributor;
          const isCopied = copiedDistributorId === dist.id;

          return (
            <div 
              key={dist.id} 
              className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:border-emerald-300 transition duration-200"
            >
              {/* Distributor Card Header */}
              <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-lg shadow-sm">
                    {groupIdx + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-base sm:text-lg text-white">
                        {dist.companyName || dist.name}
                      </h3>
                      {dist.category && (
                        <span className="text-[11px] bg-stone-700/80 text-amber-300 px-2 py-0.5 rounded-md font-semibold border border-stone-600">
                          {dist.category}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-stone-300 mt-1">
                      <span className="flex items-center gap-1 font-semibold text-white">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        {dist.name}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-emerald-300 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        डिस्ट्रीब्यूटर WA: {dist.whatsappNumber || 'नंबर नहीं है'}
                      </span>
                      {dist.salesmanPhone ? (
                        <span className="flex items-center gap-1 font-mono text-cyan-200 font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
                          <UserCheck className="w-3 h-3 text-cyan-300" />
                          सेल्समैन ({dist.salesmanName || 'बुकर'}): {dist.salesmanPhone}
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">
                          (सेल्समैन नंबर दर्ज नहीं)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="bg-stone-800 text-amber-300 border border-stone-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                    {group.items.length} सामान {userRole === 'malik' ? `| ₹${group.subtotal.toLocaleString('en-IN')}` : ''}
                  </span>
                </div>
              </div>

              {/* Items List inside Distributor */}
              <div className="p-4 sm:p-6 divide-y divide-stone-100">
                <div className="space-y-3 pb-3">
                  {group.items.map((item, itemIdx) => {
                    const lineTotal = item.wholesalePrice > 0 ? item.wholesalePrice * item.quantity : 0;
                    return (
                      <div 
                        key={`${item.productId}-${itemIdx}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-stone-50/70 hover:bg-stone-100/80 border border-stone-200/70 transition"
                      >
                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-stone-500 w-5">
                              {itemIdx + 1}.
                            </span>
                            <span className="font-bold text-stone-900 text-sm sm:text-base">
                              {item.productName}
                            </span>
                            {item.isCustomItem && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                                पर्चे में जोड़ा गया
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-stone-500 ml-7 flex flex-wrap items-center gap-2 mt-0.5">
                            <span>इकाई (Unit): <strong className="text-stone-700">{item.unit}</strong></span>
                            {userRole === 'malik' && item.wholesalePrice > 0 && (
                              <span>• खरीद दर: ₹{item.wholesalePrice}</span>
                            )}
                            {item.customNote && (
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 rounded">
                                नोट: {item.customNote}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls & Line Total */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 ml-7 sm:ml-0">
                          <div className="flex items-center bg-white border border-stone-300 rounded-lg shadow-inner">
                            <button
                              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                              className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-l-lg transition"
                              title="कम करें"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                onUpdateQuantity(item.productId, Math.max(1, val));
                              }}
                              className="w-12 text-center text-sm font-bold text-stone-900 py-1 focus:outline-none"
                            />
                            <button
                              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                              className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-r-lg transition"
                              title="बढ़ाएं"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Line total */}
                          <div className="text-right min-w-[70px]">
                            {userRole === 'malik' ? (
                              lineTotal > 0 ? (
                                <div className="text-sm font-black text-stone-800">
                                  ₹{lineTotal.toLocaleString('en-IN')}
                                </div>
                              ) : (
                                <div className="text-xs text-stone-400 font-medium">दर तय नहीं</div>
                              )
                            ) : (
                              <div className="text-xs text-stone-500 font-medium">
                                {item.quantity} {item.unit.split(' ')[0]}
                              </div>
                            )}
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => onRemoveItem(item.productId)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="हटाएं"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Add Custom Item to this Distributor */}
                <div className="pt-3 pb-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setShowAddCustomModal(dist.id);
                      setCustomItemForm({
                        name: '',
                        quantity: 1,
                        unit: 'पेटी (Carton/Box)',
                        price: 0
                      });
                    }}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ इस डिस्ट्रीब्यूटर के लिए कोई और सामान लिखें</span>
                  </button>

                  <button
                    onClick={() => onClearDistributorItems(dist.id)}
                    className="text-xs text-stone-500 hover:text-stone-700 underline"
                  >
                    इस डिस्ट्रीब्यूटर का पर्चा हटाएं
                  </button>
                </div>

                {/* Custom Note for this Distributor */}
                <div className="pt-3">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    📌 {dist.name} के लिए खास संदेश / निर्देश (WhatsApp मैसेज में जुड़ेगा):
                  </label>
                  <input
                    type="text"
                    value={customNotes[dist.id] ?? (shopProfile.defaultOrderMessage || '')}
                    onChange={(e) => setCustomNotes({ ...customNotes, [dist.id]: e.target.value })}
                    placeholder="उदा: कल दोपहर 12 बजे तक माल भिजवाएं, बिल साथ में भेजें..."
                    className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Distributor Action Bar */}
                <div className="pt-4 bg-stone-50/70 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 sm:px-6 border-t border-stone-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-xs text-stone-600">
                      <span className="font-semibold text-stone-900">{group.items.length} सामान</span> • अनुमानित बिल: <strong className="text-emerald-800 font-extrabold text-sm sm:text-base">₹{group.subtotal.toLocaleString('en-IN')}</strong>
                    </div>

                    {/* Recipient Quick Selector */}
                    {dist.salesmanPhone && (
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 text-xs shadow-2xs">
                        <span className="text-[11px] font-bold text-stone-500 pl-1.5">भेजने का विकल्प:</span>
                        <button
                          type="button"
                          onClick={() => setRecipientChoice(prev => ({ ...prev, [dist.id]: 'distributor' }))}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                            (recipientChoice[dist.id] || 'distributor') === 'distributor'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          <Building2 className="w-3 h-3" />
                          <span>🏢 डिस्ट्रीब्यूटर</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecipientChoice(prev => ({ ...prev, [dist.id]: 'salesman' }))}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                            recipientChoice[dist.id] === 'salesman'
                              ? 'bg-blue-700 text-white shadow-xs'
                              : 'text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>🚶 सेल्समैन ({dist.salesmanName || 'बुकर'})</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-200/60">
                    <div className="flex items-center gap-2">
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopyMessage(group, recipientChoice[dist.id] || 'distributor')}
                        className="text-xs flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 px-3 py-2 rounded-xl font-semibold transition"
                        title="पूरा व्हाट्सएप मैसेज कॉपी करें"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">कॉपी हो गया!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>पर्चा कॉपी</span>
                          </>
                        )}
                      </button>

                      {/* Print Slip Button */}
                      <button
                        onClick={() => onOpenPrintSlip(dist, group.items, customNotes[dist.id])}
                        className="text-xs flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 px-3 py-2 rounded-xl font-semibold transition"
                        title="पर्चा प्रिंट या डाउनलोड करें"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>प्रिंट पर्चा</span>
                      </button>
                    </div>

                    {/* WhatsApp Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 ml-auto w-full sm:w-auto">
                      {/* Option 1: Direct WhatsApp to Distributor */}
                      <button
                        onClick={() => handleSendWhatsApp(group, 'distributor')}
                        className="flex-1 sm:flex-initial text-xs sm:text-sm flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition transform active:scale-95"
                        title={`डिस्ट्रीब्यूटर ${dist.name} (${dist.whatsappNumber}) को व्हाट्सएप भेजें`}
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>🏢 डिस्ट्रीब्यूटर को भेजें</span>
                      </button>

                      {/* Option 2: Direct WhatsApp to Salesman (if available) */}
                      {dist.salesmanPhone ? (
                        <button
                          onClick={() => handleSendWhatsApp(group, 'salesman')}
                          className="flex-1 sm:flex-initial text-xs sm:text-sm flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition transform active:scale-95"
                          title={`सेल्समैन ${dist.salesmanName || ''} (${dist.salesmanPhone}) को व्हाट्सएप भेजें`}
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>🚶 सेल्समैन ({dist.salesmanName || 'बुकर'}) को भेजें</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for adding custom item directly into distributor's cart */}
      {showAddCustomModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-black text-stone-900 mb-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>पर्चे में नया सामान जोड़ें</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              अगर कोई सामान लिस्ट में नहीं है, तो आप सीधे यहां लिखकर इसी पर्चे में शामिल कर सकते हैं।
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCustomSubmit(showAddCustomModal);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  सामान का नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: कुरकुरे ₹10, आशीर्वाद बेसन 500g"
                  value={customItemForm.name}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })}
                  className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    मात्रा (Quantity) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={customItemForm.quantity}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    इकाई (Unit)
                  </label>
                  <select
                    value={customItemForm.unit}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, unit: e.target.value as UnitType })}
                    className="w-full text-sm border border-stone-300 rounded-lg px-2 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="पेटी (Carton/Box)">पेटी (Carton/Box)</option>
                    <option value="बोरी / कट्टा (Sack/Bag)">बोरी / कट्टा (Sack/Bag)</option>
                    <option value="पैकेट (Packet)">पैकेट (Packet)</option>
                    <option value="डिब्बा (Tin/Jar)">डिब्बा (Tin/Jar)</option>
                    <option value="दर्जन (Dozen)">दर्जन (Dozen)</option>
                    <option value="लीटर (Litre)">लीटर (Litre)</option>
                    <option value="किलो (Kg)">किलो (Kg)</option>
                    <option value="पीस / नग (Piece)">पीस / नग (Piece)</option>
                    <option value="अन्य (Other)">अन्य (Other)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  अनुमानित दर (₹ प्रति इकाई, यदि पता हो)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={customItemForm.price || ''}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, price: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg transition"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow transition"
                >
                  पर्चे में जोड़ें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
