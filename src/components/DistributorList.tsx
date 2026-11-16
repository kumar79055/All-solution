import React, { useState } from 'react';
import { Distributor, Product } from '../types';
import { 
  Truck, 
  MessageCircle, 
  Phone, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Package, 
  Calendar, 
  CreditCard, 
  MapPin, 
  ExternalLink 
} from 'lucide-react';
import { createWhatsAppUrl } from '../utils/whatsapp';

interface DistributorListProps {
  distributors: Distributor[];
  products: Product[];
  onOpenAddDistributor: () => void;
  onEditDistributor: (distributor: Distributor) => void;
  onDeleteDistributor: (distributorId: string) => void;
  onViewDistributorProducts: (distributorId: string) => void;
}

export const DistributorList: React.FC<DistributorListProps> = ({
  distributors,
  products,
  onOpenAddDistributor,
  onEditDistributor,
  onDeleteDistributor,
  onViewDistributorProducts
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDistributors = distributors.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.companyName.toLowerCase().includes(q) ||
      d.whatsappNumber.includes(q) ||
      d.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-700" />
            <span>डिस्ट्रीब्यूटर व सप्लायर सूची (Distributors)</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            कुल {distributors.length} डिस्ट्रीब्यूटर्स। हर डिस्ट्रीब्यूटर का व्हाट्सएप नंबर यहां सेव रहता है जिससे ऑर्डर सीधे उनके पास जाता है।
          </p>
        </div>

        <button
          onClick={onOpenAddDistributor}
          className="flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ नया डिस्ट्रीब्यूटर जोड़ें</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-5 max-w-md relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="डिस्ट्रीब्यूटर का नाम, फर्म या नंबर खोजें..."
          className="w-full text-xs sm:text-sm bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-stone-400 shadow-2xs"
        />
      </div>

      {/* Grid of Distributors */}
      {filteredDistributors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
          <Truck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-800 mb-1">कोई डिस्ट्रीब्यूटर नहीं मिला</h3>
          <p className="text-xs text-stone-500 mb-4">
            नया डिस्ट्रीब्यूटर जोड़ने के लिए ऊपर दिए गए बटन पर क्लिक करें।
          </p>
          <button
            onClick={onOpenAddDistributor}
            className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-lg transition"
          >
            + पहला डिस्ट्रीब्यूटर जोड़ें
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDistributors.map((dist) => {
            const supplierProducts = products.filter(p => p.distributorId === dist.id);
            const directChatUrl = dist.whatsappNumber ? createWhatsAppUrl(dist.whatsappNumber, `नमस्ते ${dist.name} जी!`) : null;

            return (
              <div
                key={dist.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Category Pill */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full truncate">
                      {dist.category || 'जनरल किराना'}
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-stone-400" />
                      {supplierProducts.length} सामान
                    </span>
                  </div>

                  {/* Firm / Company Name */}
                  <h3 className="font-extrabold text-stone-900 text-base sm:text-lg leading-snug mb-0.5 line-clamp-1">
                    {dist.companyName || dist.name}
                  </h3>
                  
                  {/* Contact Person */}
                  <p className="text-xs font-semibold text-stone-600 mb-3 flex items-center gap-1">
                    <span>संपर्क: {dist.name}</span>
                  </p>

                  {/* WhatsApp Details Box */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 mb-2 space-y-2">
                    {/* Distributor WhatsApp */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        </div>
                        <div>
                          <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">🏢 डिस्ट्रीब्यूटर WhatsApp</div>
                          <div className="text-xs font-black font-mono text-emerald-950">
                            {dist.whatsappNumber || 'नंबर नहीं है'}
                          </div>
                        </div>
                      </div>

                      {directChatUrl && (
                        <a
                          href={directChatUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-1 rounded-lg flex items-center gap-1 transition"
                          title="डिस्ट्रीब्यूटर को चैट भेजें"
                        >
                          <span>चैट</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Salesman WhatsApp if present */}
                    {dist.salesmanPhone && (
                      <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                            🚶
                          </div>
                          <div>
                            <div className="text-[10px] text-amber-900 font-bold uppercase tracking-wider">
                              सेल्समैन: {dist.salesmanName || 'ऑर्डर बुकर'}
                            </div>
                            <div className="text-xs font-black font-mono text-stone-900">
                              {dist.salesmanPhone}
                            </div>
                          </div>
                        </div>

                        <a
                          href={createWhatsAppUrl(dist.salesmanPhone, `नमस्ते ${dist.salesmanName || 'भाई'}! हमारी दुकान का आर्डर...`)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded-lg flex items-center gap-1 transition"
                          title="सेल्समैन को चैट भेजें"
                        >
                          <span>चैट</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {dist.alternatePhone && (
                      <div className="text-[11px] text-stone-600 pt-1 border-t border-emerald-200/50 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>अतिरिक्त फोन: {dist.alternatePhone}</span>
                      </div>
                    )}
                  </div>

                  {/* Meta Details */}
                  <div className="space-y-1 text-xs text-stone-600 mb-3">
                    {dist.deliveryDays && dist.deliveryDays.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        <span className="truncate">डिलीवरी: {dist.deliveryDays.join(', ')}</span>
                      </div>
                    )}

                    {dist.upiId && (
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        <span className="font-mono text-[11px] text-stone-700 truncate">UPI: {dist.upiId}</span>
                      </div>
                    )}

                    {dist.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        <span className="truncate text-stone-500">{dist.address}</span>
                      </div>
                    )}

                    {dist.notes && (
                      <div className="text-[11px] text-amber-800 bg-amber-50/80 px-2 py-1 rounded-md mt-1 border border-amber-200/50">
                        📌 {dist.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditDistributor(dist)}
                      className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition"
                      title="जानकारी बदलें"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteDistributor(dist.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onViewDistributorProducts(dist.id)}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-stone-100 hover:bg-emerald-50 border border-stone-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                  >
                    <Package className="w-3.5 h-3.5 text-emerald-700" />
                    <span>इनके सामान देखें ({supplierProducts.length})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
