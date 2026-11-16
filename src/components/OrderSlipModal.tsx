import React from 'react';
import { Distributor, CartItem, ShopProfile } from '../types';
import { Printer, Copy, Check, X, MessageCircle, FileText, Store, UserCheck, Building2 } from 'lucide-react';
import { generateWhatsAppOrderMessage, createWhatsAppUrl } from '../utils/whatsapp';

interface OrderSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributor: Distributor | null;
  items: CartItem[];
  shopProfile: ShopProfile;
  customNote?: string;
}

export const OrderSlipModal: React.FC<OrderSlipModalProps> = ({
  isOpen,
  onClose,
  distributor,
  items,
  shopProfile,
  customNote
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !distributor) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.wholesalePrice > 0 ? item.wholesalePrice * item.quantity : 0),
    0
  );

  const now = new Date();
  const dateStr = now.toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('hi-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const msg = generateWhatsAppOrderMessage({
      distributor,
      items,
      shopProfile,
      customNote
    });
    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getWhatsAppHref = (target: 'distributor' | 'salesman') => {
    const isSalesman = target === 'salesman' && Boolean(distributor.salesmanPhone);
    const phone = isSalesman ? distributor.salesmanPhone! : distributor.whatsappNumber;
    const msg = generateWhatsAppOrderMessage({
      distributor,
      items,
      shopProfile,
      customNote,
      targetRecipient: isSalesman ? 'salesman' : 'distributor'
    });
    return createWhatsAppUrl(phone, msg);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-stone-200 my-6">
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-black text-stone-900">
              किराना माल ऑर्डर पर्चा (Order Slip)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Slip Preview Container */}
        <div 
          id="printable-slip" 
          className="bg-amber-50/40 border border-stone-300 rounded-xl p-4 sm:p-5 font-sans text-stone-900 shadow-inner"
        >
          {/* Shop Header */}
          <div className="text-center pb-3 border-b-2 border-dashed border-stone-400">
            <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-extrabold text-lg sm:text-xl">
              <Store className="w-5 h-5" />
              <span>{shopProfile.shopName || 'किराना स्टोर'}</span>
            </div>
            {shopProfile.ownerName && (
              <p className="text-xs text-stone-600 font-medium">
                प्रोपराइटर: {shopProfile.ownerName}
              </p>
            )}
            {shopProfile.phone && (
              <p className="text-xs font-mono text-stone-600">
                मो: {shopProfile.phone}
              </p>
            )}
            {shopProfile.address && (
              <p className="text-[11px] text-stone-500 max-w-xs mx-auto mt-0.5">
                {shopProfile.address}
              </p>
            )}
          </div>

          {/* Supplier Info */}
          <div className="py-2.5 border-b border-dashed border-stone-300 text-xs space-y-0.5">
            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>दिनांक: {dateStr}</span>
              <span>समय: {timeStr}</span>
            </div>
            <div className="pt-1 font-bold text-stone-900">
              सप्लायर: {distributor.name}
            </div>
            <div className="text-stone-700">
              फर्म: {distributor.companyName}
            </div>
            <div className="font-mono text-emerald-800 font-semibold">
              डिस्ट्रीब्यूटर WA: {distributor.whatsappNumber}
            </div>
            {distributor.salesmanPhone && (
              <div className="font-mono text-blue-800 font-semibold">
                सेल्समैन ({distributor.salesmanName || 'बुकर'}): {distributor.salesmanPhone}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-3">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex justify-between">
              <span>सामान व मात्रा</span>
              <span>अनुमानित दर</span>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs border-b border-stone-200/60 pb-1.5">
                  <div className="pr-2">
                    <span className="font-bold text-stone-900">
                      {idx + 1}. {item.productName}
                    </span>
                    <div className="text-[11px] text-stone-600 font-medium">
                      मात्रा: <strong className="text-emerald-900">{item.quantity} {item.unit}</strong>
                      {item.customNote && <span className="text-amber-800"> ({item.customNote})</span>}
                    </div>
                  </div>
                  <div className="text-right whitespace-nowrap font-mono">
                    {item.wholesalePrice > 0 ? (
                      <>
                        <div className="font-bold text-stone-900">
                          ₹{(item.wholesalePrice * item.quantity).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          @₹{item.wholesalePrice}
                        </div>
                      </>
                    ) : (
                      <span className="text-stone-400 text-[11px]">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grand Total */}
          <div className="pt-2 border-t-2 border-stone-800 flex justify-between items-center text-sm font-black">
            <span>कुल सामान: {items.length} ({items.reduce((s, i) => s + i.quantity, 0)} नग)</span>
            {totalAmount > 0 ? (
              <span className="text-base text-emerald-900">
                कुल: ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            ) : null}
          </div>

          {/* Delivery Note */}
          {(customNote || shopProfile.defaultOrderMessage) && (
            <div className="mt-3 p-2 bg-white rounded border border-stone-200 text-[11px] text-stone-700">
              <strong>नोट / निर्देश:</strong> {customNote || shopProfile.defaultOrderMessage}
            </div>
          )}

          <div className="text-center text-[10px] text-stone-400 mt-3 italic">
            -- किराना ऑर्डर साथी द्वारा स्वचालित जनरेटेड पर्चा --
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="mt-4 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-2 rounded-xl border border-stone-300 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">कॉपी हो गया!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>पर्चा कॉपी करें</span>
              </>
            )}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-bold bg-stone-800 hover:bg-stone-900 text-white px-3.5 py-2 rounded-xl shadow transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट पर्चा</span>
            </button>

            <a
              href={getWhatsAppHref('distributor')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl shadow transition"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>डिस्ट्रीब्यूटर WA</span>
            </a>

            {distributor.salesmanPhone && (
              <a
                href={getWhatsAppHref('salesman')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl shadow transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>सेल्समैन WA</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
