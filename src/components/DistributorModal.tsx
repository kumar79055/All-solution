import React, { useState, useEffect } from 'react';
import { Distributor } from '../types';
import { Truck, MessageCircle, X, UserCheck, User } from 'lucide-react';

interface DistributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (distributor: Distributor) => void;
  distributorToEdit?: Distributor | null;
}

const COMMON_CATEGORIES = [
  'बिस्कुट, नमकीन व बेकरी',
  'खाद्य तेल, रिफाइंड व देशी घी',
  'मसाले, दालें, आटा व चीनी',
  'साबुन, डिटर्जेंट व कॉस्मेटिक्स',
  'चाय पत्ती, कॉफी व डेयरी प्रोडक्ट्स',
  'कन्फेक्शनरी, चॉकलेट व टॉफी',
  'ड्राय फ्रूट्स व पूजन सामग्री',
  'कोल्ड ड्रिंक्स व जूस',
  'प्लास्टिक व पैकेजिंग सामान',
  'जनरल किराना'
];

const DAYS_OF_WEEK = [
  'सोमवार (Mon)',
  'मंगलवार (Tue)',
  'बुधवार (Wed)',
  'गुरुवार (Thu)',
  'शुक्रवार (Fri)',
  'शनिवार (Sat)',
  'रविवार (Sun)'
];

export const DistributorModal: React.FC<DistributorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  distributorToEdit
}) => {
  const [formData, setFormData] = useState<Omit<Distributor, 'id' | 'createdAt'>>({
    name: '',
    companyName: '',
    whatsappNumber: '',
    salesmanName: '',
    salesmanPhone: '',
    alternatePhone: '',
    category: 'बिस्कुट, नमकीन व बेकरी',
    deliveryDays: [],
    upiId: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    if (distributorToEdit) {
      setFormData({
        name: distributorToEdit.name,
        companyName: distributorToEdit.companyName,
        whatsappNumber: distributorToEdit.whatsappNumber,
        salesmanName: distributorToEdit.salesmanName || '',
        salesmanPhone: distributorToEdit.salesmanPhone || '',
        alternatePhone: distributorToEdit.alternatePhone || '',
        category: distributorToEdit.category,
        deliveryDays: distributorToEdit.deliveryDays || [],
        upiId: distributorToEdit.upiId || '',
        address: distributorToEdit.address || '',
        notes: distributorToEdit.notes || ''
      });
    } else {
      setFormData({
        name: '',
        companyName: '',
        whatsappNumber: '',
        salesmanName: '',
        salesmanPhone: '',
        alternatePhone: '',
        category: 'बिस्कुट, नमकीन व बेकरी',
        deliveryDays: [],
        upiId: '',
        address: '',
        notes: ''
      });
    }
  }, [distributorToEdit, isOpen]);

  if (!isOpen) return null;

  const handleDayToggle = (day: string) => {
    const current = formData.deliveryDays || [];
    if (current.includes(day)) {
      setFormData({ ...formData, deliveryDays: current.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, deliveryDays: [...current, day] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.whatsappNumber.trim()) return;

    // Clean phone numbers (leave digits only)
    const cleanPhone = formData.whatsappNumber.replace(/\D/g, '');
    const cleanSalesmanPhone = formData.salesmanPhone ? formData.salesmanPhone.replace(/\D/g, '') : '';

    const finalDistributor: Distributor = {
      id: distributorToEdit ? distributorToEdit.id : `dist-${Date.now()}`,
      name: formData.name.trim(),
      companyName: formData.companyName.trim() || formData.name.trim(),
      whatsappNumber: cleanPhone,
      salesmanName: formData.salesmanName?.trim() || '',
      salesmanPhone: cleanSalesmanPhone,
      alternatePhone: formData.alternatePhone?.trim() || '',
      category: formData.category.trim() || 'जनरल किराना',
      deliveryDays: formData.deliveryDays,
      upiId: formData.upiId?.trim() || '',
      address: formData.address?.trim() || '',
      notes: formData.notes?.trim() || '',
      createdAt: distributorToEdit ? distributorToEdit.createdAt : new Date().toISOString()
    };

    onSave(finalDistributor);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-stone-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">
                {distributorToEdit ? 'डिस्ट्रीब्यूटर जानकारी बदलें' : 'नया डिस्ट्रीब्यूटर जोड़ें (Add Supplier)'}
              </h3>
              <p className="text-xs text-stone-500">
                व्हाट्सएप नंबर डालना अनिवार्य है ताकि ऑर्डर सीधे उनके पास जाए
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Firm / Company Name */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              फर्म / एजेंसी का नाम (Company / Agency Name) *
            </label>
            <input
              type="text"
              required
              placeholder="उदा: श्री बालाजी एजेंसीज (पारले, ब्रिटानिया)"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Contact Person Name & WhatsApp No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                संपर्क व्यक्ति का नाम (Distributor Name) *
              </label>
              <input
                type="text"
                required
                placeholder="उदा: मोहन लाल जी / सेल्समैन"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>व्हाट्सएप नंबर (WhatsApp No.) *</span>
              </label>
              <input
                type="tel"
                required
                placeholder="10 अंकों का मोबाइल नंबर (उदा: 9876543210)"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full text-sm font-mono border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Salesman Details Box */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
              <UserCheck className="w-4 h-4 text-amber-700" />
              <span>🚶 सेल्समैन / ऑर्डर बुकर की जानकारी (Salesman WhatsApp Details)</span>
            </div>
            <p className="text-[11px] text-stone-500">
              ऑर्डर लेने आने वाले सेल्समैन का नंबर (चेकआउट के समय आप डिस्ट्रीब्यूटर या सेल्समैन दोनों में से किसी को भी ऑर्डर भेज सकेंगे)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  सेल्समैन का नाम (Salesman Name)
                </label>
                <input
                  type="text"
                  placeholder="उदा: राहुल (पारले सेल्समैन)"
                  value={formData.salesmanName}
                  onChange={(e) => setFormData({ ...formData, salesmanName: e.target.value })}
                  className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  <span>सेल्समैन का WhatsApp नंबर</span>
                </label>
                <input
                  type="tel"
                  placeholder="उदा: 9823456789"
                  value={formData.salesmanPhone}
                  onChange={(e) => setFormData({ ...formData, salesmanPhone: e.target.value })}
                  className="w-full text-sm font-mono border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Category Dropdown + Custom */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              सप्लाई की मुख्य कैटेगरी (Product Category) *
            </label>
            <div className="flex gap-2">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="flex-1 text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {COMMON_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="mt-1">
              <input
                type="text"
                placeholder="या अपनी खुद की कोई कैटेगरी लिखें..."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs text-stone-600 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Alternate phone & UPI ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                दूसरा फोन नंबर (वैकल्पिक)
              </label>
              <input
                type="tel"
                placeholder="उदा: 9876543211"
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                UPI ID (पेमेंट के लिए, यदि हो)
              </label>
              <input
                type="text"
                placeholder="उदा: 9876543210@paytm"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Delivery Days checkboxes */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              डिलीवरी के दिन (किन-किन दिनों माल आता है):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map(day => {
                const isSelected = formData.deliveryDays?.includes(day.split(' ')[0]);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day.split(' ')[0])}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-800 font-bold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warehouse / Address */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              गोदाम / दुकान का पता (वैकल्पिक)
            </label>
            <input
              type="text"
              placeholder="उदा: गोदाम नं. 4, ट्रांसपोर्ट नगर, मंडी"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              विशेष टिप्पणी / नोट (उदा: शाम 5 बजे से पहले ऑर्डर देना है)
            </label>
            <input
              type="text"
              placeholder="उदा: सुबह 10 बजे से पहले ऑर्डर करें, 5% स्कीम"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md transition"
            >
              {distributorToEdit ? 'अपडेट करें' : 'डिस्ट्रीब्यूटर सेव करें'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
