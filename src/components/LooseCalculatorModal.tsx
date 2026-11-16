import React, { useState } from 'react';
import { Scale, IndianRupee, ArrowRightLeft, X, Sparkles, Check, Plus, Minus } from 'lucide-react';
import { Product } from '../types';

interface LooseCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

interface CommonPreset {
  name: string;
  defaultRate: number;
  unit: string;
}

const COMMON_PRESETS: CommonPreset[] = [
  { name: 'मधुर चीनी (Sugar)', defaultRate: 44, unit: 'किलो (Kg)' },
  { name: 'अरहर दाल (Toor Dal)', defaultRate: 140, unit: 'किलो (Kg)' },
  { name: 'चना दाल (Chana Dal)', defaultRate: 85, unit: 'किलो (Kg)' },
  { name: 'सरसों का तेल (Mustard Oil)', defaultRate: 165, unit: 'लीटर (L)' },
  { name: 'खुला जीरा (Cumin)', defaultRate: 450, unit: 'किलो (Kg)' },
  { name: 'खुला बेसन (Besan)', defaultRate: 90, unit: 'किलो (Kg)' },
  { name: 'देसी गुड़ (Jaggery)', defaultRate: 55, unit: 'किलो (Kg)' },
  { name: 'बासमती चावल (Rice)', defaultRate: 80, unit: 'किलो (Kg)' }
];

export const LooseCalculatorModal: React.FC<LooseCalculatorModalProps> = ({
  isOpen,
  onClose,
  products
}) => {
  // 'priceToWeight' (रुपये से वजन) or 'weightToPrice' (वजन से रुपये)
  const [calcMode, setCalcMode] = useState<'priceToWeight' | 'weightToPrice'>('priceToWeight');
  
  // Rate per 1 kg / 1 Litre in INR
  const [ratePerKg, setRatePerKg] = useState<number>(44);
  const [selectedItemName, setSelectedItemName] = useState<string>('मधुर चीनी (Sugar)');

  // Price to Weight inputs
  const [inputRupees, setInputRupees] = useState<number>(20);

  // Weight to Price inputs
  const [inputWeightGrams, setInputWeightGrams] = useState<number>(250);
  const [weightUnit, setWeightUnit] = useState<'gm' | 'kg'>('gm');

  if (!isOpen) return null;

  // Calculation 1: Price -> Weight
  // Weight in grams = (Rupees / RatePerKg) * 1000
  const calculatedGrams = ratePerKg > 0 ? (inputRupees / ratePerKg) * 1000 : 0;
  const calculatedKg = calculatedGrams / 1000;

  // Calculation 2: Weight -> Price
  // Price = (Total Grams / 1000) * RatePerKg
  const actualWeightInGrams = weightUnit === 'kg' ? inputWeightGrams * 1000 : inputWeightGrams;
  const calculatedPrice = ratePerKg > 0 ? (actualWeightInGrams / 1000) * ratePerKg : 0;

  // Scale weights breakdown helper (500g, 200g, 100g, 50g, 20g, 10g)
  const getScaleWeights = (grams: number) => {
    let rem = Math.round(grams);
    const weights: string[] = [];
    const denominations = [
      { val: 1000, name: '1 किलो' },
      { val: 500, name: '500 ग्राम' },
      { val: 200, name: '200 ग्राम' },
      { val: 100, name: '100 ग्राम' },
      { val: 50, name: '50 ग्राम' },
      { val: 20, name: '20 ग्राम' },
      { val: 10, name: '10 ग्राम' },
      { val: 5, name: '5 ग्राम' }
    ];

    for (const d of denominations) {
      if (rem >= d.val) {
        const count = Math.floor(rem / d.val);
        weights.push(`${count > 1 ? count + 'x ' : ''}${d.name}`);
        rem %= d.val;
      }
    }
    return weights;
  };

  const handleSelectPreset = (preset: CommonPreset) => {
    setSelectedItemName(preset.name);
    setRatePerKg(preset.defaultRate);
  };

  const handleSelectProduct = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setSelectedItemName(prod.name);
      // In Worker mode, MRP is used as rate
      setRatePerKg(prod.mrp > 0 ? prod.mrp : prod.wholesalePrice || 40);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-stone-200 my-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-sm">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 leading-tight">
                खुला सामान वजन व भाव कैलकुलेटर
              </h3>
              <p className="text-xs text-stone-500">
                दुकानदार व वर्कर के लिए: रुपये से वजन या वजन से रुपये निकालें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-100 rounded-2xl mb-4">
          <button
            onClick={() => setCalcMode('priceToWeight')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
              calcMode === 'priceToWeight'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>रुपये ➔ कितना वजन?</span>
          </button>

          <button
            onClick={() => setCalcMode('weightToPrice')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
              calcMode === 'weightToPrice'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>वजन ➔ कितने रुपये?</span>
          </button>
        </div>

        {/* Item & Rate Selector */}
        <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                सामान का भाव (रेट प्रति किलो/लीटर):
              </label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-emerald-800">₹</span>
                <input
                  type="number"
                  min="1"
                  value={ratePerKg || ''}
                  onChange={(e) => setRatePerKg(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-28 text-lg font-black text-stone-900 bg-white border border-stone-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-xs font-bold text-stone-500">प्रति किलो (per Kg)</span>
              </div>
            </div>

            {/* Inventory Quick select */}
            {products.length > 0 && (
              <div className="sm:text-right">
                <label className="block text-[11px] font-bold text-stone-500 mb-1">
                  दुकान की लिस्ट से रेट लें:
                </label>
                <select
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="text-xs font-medium bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-stone-700 focus:outline-none max-w-[200px] truncate"
                >
                  <option value="">-- सामान चुनें --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (बिक्री: ₹{p.mrp || p.wholesalePrice})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Presets Pills */}
          <div className="pt-2 border-t border-stone-200/80">
            <span className="text-[11px] font-bold text-stone-500 block mb-1.5">
              लोकप्रिय खुला सामान (तुरंत रेट लोड करें):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition ${
                    selectedItemName === preset.name && ratePerKg === preset.defaultRate
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {preset.name.split(' ')[0]} (₹{preset.defaultRate})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mode 1: Price to Weight */}
        {calcMode === 'priceToWeight' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                ग्राहक ने कितने रुपये का सामान मांगा?
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-stone-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={inputRupees || ''}
                    onChange={(e) => setInputRupees(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full text-xl font-black text-stone-900 bg-stone-50 border border-stone-300 rounded-xl pl-8 pr-3 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="20"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Money Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[10, 20, 30, 50, 100, 200, 500].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setInputRupees(amt)}
                    className={`text-xs px-3 py-1 rounded-lg font-bold border transition ${
                      inputRupees === amt
                        ? 'bg-amber-400 text-stone-950 border-amber-500'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Result Box */}
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-lg text-center">
              <span className="text-xs uppercase font-bold text-emerald-200 tracking-wider block mb-1">
                तराजू पर इतना वजन तौलें:
              </span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-amber-300">
                {calculatedGrams >= 1000 ? (
                  <span>
                    {calculatedKg.toFixed(3)} <span className="text-xl text-white">किलो (Kg)</span>
                  </span>
                ) : (
                  <span>
                    {Math.round(calculatedGrams)} <span className="text-xl text-white">ग्राम (Grams)</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-emerald-100/90 mt-1 font-medium">
                (अर्थात {Math.round(calculatedGrams)} ग्राम = {calculatedKg.toFixed(3)} किलो)
              </div>

              {/* Batkhare / Scale weights helper */}
              {calculatedGrams > 0 && (
                <div className="mt-3 pt-3 border-t border-emerald-700/60 text-xs text-emerald-200 text-left">
                  <span className="font-bold text-white block mb-0.5">⚖️ बाट / वजन संयोजन (Scale Weights):</span>
                  <div className="flex flex-wrap gap-1">
                    {getScaleWeights(calculatedGrams).map((w, i) => (
                      <span key={i} className="bg-emerald-950/60 border border-emerald-600/40 px-2 py-0.5 rounded text-[11px] font-mono">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mode 2: Weight to Price */}
        {calcMode === 'weightToPrice' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                तराजू पर कितना वजन आया?
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={inputWeightGrams || ''}
                  onChange={(e) => setInputWeightGrams(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="flex-1 text-xl font-black text-stone-900 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="250"
                  autoFocus
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as 'gm' | 'kg')}
                  className="w-28 text-sm font-bold bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="gm">ग्राम (Grams)</option>
                  <option value="kg">किलो (Kg)</option>
                </select>
              </div>

              {/* Quick Weight Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { label: '50 ग्राम', val: 50, u: 'gm' as const },
                  { label: '100 ग्राम', val: 100, u: 'gm' as const },
                  { label: 'पाव (250g)', val: 250, u: 'gm' as const },
                  { label: 'आधा किलो (500g)', val: 500, u: 'gm' as const },
                  { label: '750 ग्राम', val: 750, u: 'gm' as const },
                  { label: '1 किलो', val: 1, u: 'kg' as const },
                  { label: '2 किलो', val: 2, u: 'kg' as const }
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setInputWeightGrams(item.val);
                      setWeightUnit(item.u);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg font-bold border bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200 transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Result Box */}
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-lg text-center">
              <span className="text-xs uppercase font-bold text-emerald-200 tracking-wider block mb-1">
                ग्राहक से इतने रुपये लें:
              </span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-amber-300">
                ₹{calculatedPrice.toFixed(2)}
              </div>
              <div className="text-xs text-emerald-100/90 mt-1 font-medium">
                (दर: ₹{ratePerKg}/किलो x {weightUnit === 'kg' ? inputWeightGrams : (inputWeightGrams / 1000).toFixed(3)} किलो)
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow transition"
          >
            बंद करें (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
