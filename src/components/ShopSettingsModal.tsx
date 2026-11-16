import React, { useState } from 'react';
import { ShopProfile } from '../types';
import { Settings, Store, X, Save, Download, Upload, RotateCcw, Check } from 'lucide-react';
import { Storage } from '../utils/storage';

interface ShopSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopProfile: ShopProfile;
  onSaveProfile: (profile: ShopProfile) => void;
  onResetData: () => void;
  onDataImported: () => void;
}

export const ShopSettingsModal: React.FC<ShopSettingsModalProps> = ({
  isOpen,
  onClose,
  shopProfile,
  onSaveProfile,
  onResetData,
  onDataImported
}) => {
  const [formData, setFormData] = useState<ShopProfile>(shopProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const handleExport = () => {
    const dataStr = Storage.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kirana-order-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = Storage.importData(content);
      if (ok) {
        setImportStatus('डेटा सफलतापूर्वक लोड हो गया!');
        setTimeout(() => {
          setImportStatus(null);
          onDataImported();
          onClose();
        }, 1200);
      } else {
        setImportStatus('फ़ाइल सही नहीं है। कृपया बैकअप JSON चुनें।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-stone-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">
                दुकान की जानकारी व सेटिंग्स
              </h3>
              <p className="text-xs text-stone-500">
                यह जानकारी आपके हर व्हाट्सएप ऑर्डर पर्चे पर दिखेगी
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
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              दुकान का नाम (Shop Name) *
            </label>
            <input
              type="text"
              required
              placeholder="उदा: श्री गणेश किराना एवं जनरल स्टोर"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full text-sm font-bold border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                दुकानदार / प्रोपराइटर का नाम
              </label>
              <input
                type="text"
                placeholder="उदा: राजेश कुमार गुप्ता"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                दुकान का मोबाइल नंबर (Phone)
              </label>
              <input
                type="tel"
                placeholder="उदा: 9876501234"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-sm font-mono border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1">
                <span>🔐 मालिक सुरक्षा पिन (4-Digit PIN)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
                value={formData.ownerPin !== undefined ? formData.ownerPin : '1234'}
                onChange={(e) => setFormData({ ...formData, ownerPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                className="w-full text-base font-mono font-bold tracking-widest text-center border-2 border-amber-400 bg-amber-50/70 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-stone-500 block">वर्कर मोड से मालिक मोड में आने का पिन</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              दुकान का पूरा पता व बाजार (Shop Address)
            </label>
            <input
              type="text"
              placeholder="उदा: दुकान नं. 12, मुख्य बाजार, चौक, कानपुर (उ.प्र.)"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              डिफ़ॉल्ट डिलीवरी निर्देश (Default WhatsApp Delivery Message)
            </label>
            <textarea
              rows={2}
              placeholder="उदा: कृपया यह सामान कल सुबह 11:00 बजे तक दुकान पर भिजवा दें। बिल साथ भेजें।"
              value={formData.defaultOrderMessage}
              onChange={(e) => setFormData({ ...formData, defaultOrderMessage: e.target.value })}
              className="w-full text-xs sm:text-sm border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <span className="text-[11px] text-stone-500">
              यह संदेश हर डिस्ट्रीब्यूटर को भेजे जाने वाले व्हाट्सएप पर्चे में अपने आप शामिल रहेगा
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> सेव हो गया!
              </span>
            ) : <span></span>}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>सेटिंग्स सेव करें</span>
              </button>
            </div>
          </div>
        </form>

        {/* Data Backup & Restore Section */}
        <div className="mt-6 pt-5 border-t border-stone-200">
          <h4 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
            डेटा बैकअप व रीसेट (Data Backup & Reset)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="text-xs flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 px-3 py-2.5 rounded-xl font-semibold transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>बैकअप डाउनलोड</span>
            </button>

            <label className="cursor-pointer text-xs flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 px-3 py-2.5 rounded-xl font-semibold transition">
              <Upload className="w-3.5 h-3.5 text-blue-700" />
              <span>बैकअप लोड करें</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('क्या आप डिफ़ॉल्ट डेमो डेटा (पारले, फॉर्च्यून, एमडीएच आदि) रीसेट करना चाहते हैं?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-xs flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-300 hover:border-red-200 px-3 py-2.5 rounded-xl font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>डेमो डेटा रीसेट</span>
            </button>
          </div>

          {importStatus && (
            <p className="text-xs font-bold text-center mt-2 text-emerald-700">
              {importStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
