import React, { useState, useEffect } from 'react';
import { Product, Distributor, UnitType } from '../types';
import { Package, X, Truck } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  distributors: Distributor[];
  productToEdit?: Product | null;
  defaultDistributorId?: string;
}

const UNIT_OPTIONS: UnitType[] = [
  'पेटी (Carton/Box)',
  'बोरी / कट्टा (Sack/Bag)',
  'पैकेट (Packet)',
  'डिब्बा (Tin/Jar)',
  'दर्जन (Dozen)',
  'लीटर (Litre)',
  'किलो (Kg)',
  'पीस / नग (Piece)',
  'अन्य (Other)'
];

const COMMON_PRODUCT_CATEGORIES = [
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

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  distributors,
  productToEdit,
  defaultDistributorId
}) => {
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'updatedAt'>>({
    name: '',
    hindiName: '',
    distributorId: defaultDistributorId || (distributors[0]?.id ?? ''),
    category: 'बिस्कुट, नमकीन व बेकरी',
    currentStock: 5,
    minStockAlert: 2,
    unit: 'पेटी (Carton/Box)',
    wholesalePrice: 0,
    mrp: 0,
    barcode: '',
    notes: ''
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        hindiName: productToEdit.hindiName || '',
        distributorId: productToEdit.distributorId,
        category: productToEdit.category,
        currentStock: productToEdit.currentStock,
        minStockAlert: productToEdit.minStockAlert,
        unit: productToEdit.unit,
        wholesalePrice: productToEdit.wholesalePrice || 0,
        mrp: productToEdit.mrp || 0,
        barcode: productToEdit.barcode || '',
        notes: productToEdit.notes || ''
      });
    } else {
      const distId = defaultDistributorId || (distributors[0]?.id ?? '');
      const selectedDist = distributors.find(d => d.id === distId);
      setFormData({
        name: '',
        hindiName: '',
        distributorId: distId,
        category: selectedDist ? selectedDist.category : 'बिस्कुट, नमकीन व बेकरी',
        currentStock: 5,
        minStockAlert: 2,
        unit: 'पेटी (Carton/Box)',
        wholesalePrice: 0,
        mrp: 0,
        barcode: '',
        notes: ''
      });
    }
  }, [productToEdit, defaultDistributorId, distributors, isOpen]);

  // When distributor changes, auto sync category with distributor's category if empty/default
  const handleDistributorChange = (distId: string) => {
    const selectedDist = distributors.find(d => d.id === distId);
    setFormData(prev => ({
      ...prev,
      distributorId: distId,
      category: selectedDist ? selectedDist.category : prev.category
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.distributorId) return;

    const finalProduct: Product = {
      id: productToEdit ? productToEdit.id : `prod-${Date.now()}`,
      name: formData.name.trim(),
      hindiName: formData.hindiName?.trim() || '',
      distributorId: formData.distributorId,
      category: formData.category.trim() || 'जनरल किराना',
      currentStock: Number(formData.currentStock) || 0,
      minStockAlert: Number(formData.minStockAlert) || 0,
      unit: formData.unit,
      wholesalePrice: Number(formData.wholesalePrice) || 0,
      mrp: Number(formData.mrp) || 0,
      barcode: formData.barcode?.trim() || '',
      notes: formData.notes?.trim() || '',
      updatedAt: new Date().toISOString()
    };

    onSave(finalProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-stone-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">
                {productToEdit ? 'सामान की जानकारी बदलें' : 'नया किराना सामान जोड़ें'}
              </h3>
              <p className="text-xs text-stone-500">
                सामान का सप्लायर (डिस्ट्रीब्यूटर) चुनें ताकि ऑर्डर उनके पास जाए
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
          {/* Distributor Selection */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
            <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>सप्लायर / डिस्ट्रीब्यूटर चुनें (Distributor) *</span>
            </label>
            <select
              required
              value={formData.distributorId}
              onChange={(e) => handleDistributorChange(e.target.value)}
              className="w-full text-sm font-semibold border border-emerald-300 rounded-lg px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {distributors.length === 0 && (
                <option value="">कोई डिस्ट्रीब्यूटर नहीं है (पहले डिस्ट्रीब्यूटर बनाएं)</option>
              )}
              {distributors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.companyName || d.name} — {d.name} (WhatsApp: {d.whatsappNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Product Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                सामान का नाम (Product Name) *
              </label>
              <input
                type="text"
                required
                placeholder="उदा: Parle-G ₹5, Fortune Oil 1L"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                हिंदी नाम / उपनाम (वैकल्पिक)
              </label>
              <input
                type="text"
                placeholder="उदा: पारले जी छोटा, फॉर्च्यून तेल"
                value={formData.hindiName}
                onChange={(e) => setFormData({ ...formData, hindiName: e.target.value })}
                className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                कैटेगरी (Category)
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {COMMON_PRODUCT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                इकाई (Unit) *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitType })}
                className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
              >
                {UNIT_OPTIONS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock & Low Stock Alert */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                दुकान में मौजूदा स्टॉक (Current Stock)
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                कम स्टॉक चेतावनी सीमा (Min Stock Alert)
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 0 })}
                className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-stone-500">
                स्टॉक इससे कम होने पर लाल चेतावनी दिखेगी
              </span>
            </div>
          </div>

          {/* Wholesale price & MRP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                डिस्ट्रीब्यूटर खरीद दर (₹ Wholesale Price)
              </label>
              <input
                type="number"
                min="0"
                placeholder="उदा: 480"
                value={formData.wholesalePrice || ''}
                onChange={(e) => setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) || 0 })}
                className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                बिक्री मूल्य (₹ MRP / Retail)
              </label>
              <input
                type="number"
                min="0"
                placeholder="उदा: 600"
                value={formData.mrp || ''}
                onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })}
                className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              अतिरिक्त जानकारी / पैकेजिंग नोट (उदा: 1 पेटी में 72 पैकेट)
            </label>
            <input
              type="text"
              placeholder="उदा: 120 पैकेट प्रति पेटी, 24 पीस का बंडल"
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
              {productToEdit ? 'अपडेट करें' : 'सामान सेव करें'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
