import React, { useState } from 'react';
import { OrderRecord, CartItem } from '../types';
import { 
  History, 
  MessageCircle, 
  Calendar, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Trash2, 
  Search, 
  Truck, 
  ChevronDown, 
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { createWhatsAppUrl } from '../utils/whatsapp';

interface OrderHistoryProps {
  orders: OrderRecord[];
  onUpdateOrderStatus: (orderId: string, status: OrderRecord['status']) => void;
  onDeleteOrder: (orderId: string) => void;
  onClearHistory: () => void;
  onReorder: (order: OrderRecord) => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
  onClearHistory,
  onReorder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    return (
      o.distributorName.toLowerCase().includes(q) ||
      o.companyName.toLowerCase().includes(q) ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.items.some(i => i.name.toLowerCase().includes(q))
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-700" />
            डिलीवर हो गया (Delivered)
          </span>
        );
      case 'pending':
        return (
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-700" />
            डिलीवरी बाकी (Pending)
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[11px] font-bold text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded-full">
            रद्द (Cancelled)
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <MessageCircle className="w-3 h-3 text-blue-600" />
            व्हाट्सएप पर भेजा गया (Sent)
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-700" />
            <span>ऑर्डर रिकॉर्ड व डिलीवरी बहीखाता (Order History)</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            डिस्ट्रीब्यूटर्स को भेजे गए सभी पुराने ऑर्डर्स का हिसाब-किताब। कब कौन सा माल मंगाया गया, सब सुरक्षित रहता है।
          </p>
        </div>

        {orders.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-xl transition flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>इतिहास साफ करें</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      {orders.length > 0 && (
        <div className="mb-5 max-w-md relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="डिस्ट्रीब्यूटर या सामान का नाम खोजें..."
            className="w-full text-xs sm:text-sm bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-stone-400"
          />
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
          <History className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-800 mb-1">कोई पुराना ऑर्डर नहीं है</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            जब आप कार्ट से किसी डिस्ट्रीब्यूटर को व्हाट्सएप पर ऑर्डर भेजेंगे, तो वह ऑर्डर रिकॉर्ड यहां अपने आप सेव हो जाएगा।
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const dateObj = new Date(order.sentAt);
            const dateFormatted = dateObj.toLocaleDateString('hi-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
            const timeFormatted = dateObj.toLocaleTimeString('hi-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-200 transition overflow-hidden"
              >
                {/* Header row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-stone-900 text-base">
                          {order.companyName || order.distributorName}
                        </h3>
                        <span className="text-xs font-mono text-stone-500">
                          #{order.orderNumber}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {dateFormatted}, {timeFormatted}
                        </span>
                        <span>• सप्लायर: <strong>{order.distributorName}</strong></span>
                        {order.recipientType === 'salesman' ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                            🚶 सेल्समैन: {order.recipientName || 'बुकर'} ({order.recipientPhone || order.distributorPhone})
                          </span>
                        ) : (
                          <span className="font-mono text-emerald-700">
                            🏢 डिस्ट्रीब्यूटर ({order.recipientPhone || order.distributorPhone})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Status Dropdown */}
                    <div className="flex items-center gap-1">
                      {getStatusBadge(order.status)}
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderRecord['status'])}
                        className="text-xs border border-stone-200 rounded-lg px-2 py-1 text-stone-700 bg-white focus:outline-none"
                      >
                        <option value="sent">भेजा गया (Sent)</option>
                        <option value="pending">डिलीवरी बाकी (Pending)</option>
                        <option value="delivered">डिलीवर हो गया (Delivered)</option>
                        <option value="cancelled">रद्द (Cancelled)</option>
                      </select>
                    </div>

                    <div className="text-right">
                      <div className="text-sm sm:text-base font-black text-stone-900">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {order.items.length} आइटम
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                      title={isExpanded ? 'कम करें' : 'विस्तार से देखें'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Item Details */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-stone-100 space-y-3">
                    <div className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                      मंगवाए गए सामान की सूची:
                    </div>

                    <div className="space-y-1.5 bg-stone-50/70 p-3 rounded-xl border border-stone-200">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-stone-800 py-1 border-b border-stone-200/50 last:border-0">
                          <div>
                            <span className="font-semibold text-stone-900">{idx + 1}. {item.name}</span>
                            <span className="text-stone-500 ml-2">({item.quantity} {item.unit})</span>
                          </div>
                          <div className="font-mono font-medium">
                            {item.total > 0 ? `₹${item.total.toLocaleString('en-IN')}` : '—'}
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.customNote && (
                      <div className="text-xs text-stone-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        <strong>निर्देश / नोट:</strong> {order.customNote}
                      </div>
                    )}

                    {/* Quick Reorder Action */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <button
                        onClick={() => onDeleteOrder(order.id)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>यह रिकॉर्ड हटाएं</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onReorder(order)}
                          className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 px-3.5 py-2 rounded-xl shadow-xs transition"
                          title="इस ऑर्डर के सभी सामान दोबारा कार्ट में डालें"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>यही माल दोबारा कार्ट में डालें (Re-Order)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
