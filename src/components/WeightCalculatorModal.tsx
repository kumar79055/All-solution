import React, { useState } from 'react';
import { 
  Scale, 
  X, 
  Calculator, 
  Package, 
  ArrowRight, 
  RotateCcw, 
  Plus, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { UnitType } from '../types';

interface WeightCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomItemToCart?: (item: { name: string; quantity: number; unit: string; price: number }) => void;
}

export const WeightCalculatorModal: React.FC<WeightCalculatorModalProps> = ({
  isOpen,
  onClose,
  onAddCustomItemToCart
}) => {
  const [activeTab, setActiveTab] = useState<'weightToPrice' | 'priceToWeight' | 'bulkConverter'>('weightToPrice');

  // Mode 1: Weight to Price (वजन से दाम)
  const [ratePerKg, setRatePerKg] = useState<string>('120');
  const [weightKg, setWeightKg] = useState<string>('0');
  const [weightGram, setWeightGram] = useState<string>('250');

  // Mode 2: Price to Weight (रुपये से वजन)
  const [rateForMoney, setRateForMoney] = useState<string>('120');
  const [targetMoney, setTargetMoney] = useState<string>('50');

  // Mode 3: Bulk Peti / Bori to Unit Cost (पेटी व बोरी से 1 पीस/किलो का भाव)
  const [bulkItemName, setBulkItemName] = useState<string>('Parle-G 5/- पेटी');
  const [bulkPrice, setBulkPrice] = useState<string>('480');
  const [bulkUnitsCount, setBulkUnitsCount] = useState<string>('120'); // 120 packets in carton
  const [retailMrp, setRetailMrp] = useState<string>('5');

  // Calculation Results
  // 1. Weight to Price
  const totalWeightInGrams = (parseFloat(weightKg) || 0) * 1000 + (parseFloat(weightGram) || 0);
  const calculatedPrice = totalWeightInGrams > 0 && parseFloat(ratePerKg) > 0
    ? ((totalWeightInGrams / 1000) * parseFloat(ratePerKg)).toFixed(2)
    : '0.00';

  // 2. Price to Weight
  const calculatedGrams = parseFloat(targetMoney) > 0 && parseFloat(rateForMoney) > 0
    ? ((parseFloat(targetMoney) / parseFloat(rateForMoney)) * 1000).toFixed(1)
    : '0';
  const calculatedKg = (parseFloat(calculatedGrams) / 1000).toFixed(3);

  // 3. Bulk to Unit
  const unitCost = parseFloat(bulkPrice) > 0 && parseFloat(bulkUnitsCount) > 0
    ? (parseFloat(bulkPrice) / parseFloat(bulkUnitsCount)).toFixed(2)
    : '0.00';
  const profitPerPiece = parseFloat(retailMrp) > 0 && parseFloat(unitCost) > 0
    ? (parseFloat(retailMrp) - parseFloat(unitCost)).toFixed(2)
    : '0.00';
  const marginPercent = parseFloat(retailMrp) > 0 && parseFloat(profitPerPiece) > 0
    ? (((parseFloat(retailMrp) - parseFloat(unitCost)) / parseFloat(retailMrp)) * 100).toFixed(1)
    : '0';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-stone-200 my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 leading-tight">
                किराना तौल व भाव कैलकुलेटर
              </h3>
              <p className="text-xs text-stone-500">
                Weight & Rate Calculator (ग्राम, किलो, पाव, पेटी व बोरी)
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

        {/* Tab selection */}
        <div className="flex items-center bg-stone-100 p-1 rounded-2xl mb-4 gap-1">
          <button
            onClick={() => setActiveTab('weightToPrice')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'weightToPrice'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            ⚖️ वजन से रुपये
          </button>
          <button
            onClick={() => setActiveTab('priceToWeight')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'priceToWeight'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            💵 रुपये से वजन
          </button>
          <button
            onClick={() => setActiveTab('bulkConverter')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'bulkConverter'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            📦 पेटी/बोरी मार्जिन
          </button>
        </div>

        {/* Mode 1: Weight to Price */}
        {activeTab === 'weightToPrice' && (
          <div className="space-y-4">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                सामान का भाव (₹ प्रति किलो Rate) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-500 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={ratePerKg}
                  onChange={(e) => setRatePerKg(e.target.value)}
                  placeholder="उदा: 120"
                  className="w-full text-base font-black pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900"
                />
              </div>
            </div>

            {/* Weight inputs: Kg + Grams */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  किलोग्राम (Kilograms)
                </label>
                <input
                  type="number"
                  min="0"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="0"
                  className="w-full text-base font-bold px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ग्राम (Grams)
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={weightGram}
                  onChange={(e) => setWeightGram(e.target.value)}
                  placeholder="250"
                  className="w-full text-base font-bold px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900"
                />
              </div>
            </div>

            {/* Quick Weight Presets */}
            <div>
              <span className="text-[11px] font-bold text-stone-500 block mb-1.5">
                ⚡ तुरंत वजन चुनें:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '50 ग्राम', kg: '0', g: '50' },
                  { label: '100 ग्राम', kg: '0', g: '100' },
                  { label: '250 ग्राम (पाव)', kg: '0', g: '250' },
                  { label: '500 ग्राम (आधा किलो)', kg: '0', g: '500' },
                  { label: '750 ग्राम (तीन पाव)', kg: '0', g: '750' },
                  { label: '1 किलो', kg: '1', g: '0' },
                  { label: '2 किलो', kg: '2', g: '0' },
                  { label: '5 किलो', kg: '5', g: '0' }
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setWeightKg(preset.kg);
                      setWeightGram(preset.g);
                    }}
                    className="text-xs bg-stone-100 hover:bg-amber-100 border border-stone-200 text-stone-800 px-2.5 py-1 rounded-lg font-semibold transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Big Result Card */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-200 font-bold uppercase tracking-wide">
                  ग्राहक से लेने योग्य कुल रुपये
                </div>
                <div className="text-3xl sm:text-4xl font-black text-amber-300 mt-1">
                  ₹{calculatedPrice}
                </div>
                <div className="text-xs text-emerald-100/90 mt-1">
                  वजन: {totalWeightInGrams} ग्राम ({ (totalWeightInGrams / 1000).toFixed(3) } किलो) @ ₹{ratePerKg}/किलो
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-amber-300" />
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Price to Weight */}
        {activeTab === 'priceToWeight' && (
          <div className="space-y-4">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                सामान का भाव (₹ प्रति किलो Rate) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-500 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={rateForMoney}
                  onChange={(e) => setRateForMoney(e.target.value)}
                  placeholder="उदा: 120"
                  className="w-full text-base font-black pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ग्राहक ने कितने रुपये का सामान मांगा? (Amount ₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-500 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={targetMoney}
                  onChange={(e) => setTargetMoney(e.target.value)}
                  placeholder="उदा: 50"
                  className="w-full text-base font-black pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900"
                />
              </div>
            </div>

            {/* Quick Amount Presets */}
            <div>
              <span className="text-[11px] font-bold text-stone-500 block mb-1.5">
                ⚡ तुरंत रुपये चुनें:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['10', '20', '30', '50', '100', '200', '500'].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTargetMoney(amt)}
                    className="text-xs bg-stone-100 hover:bg-amber-100 border border-stone-200 text-stone-800 px-3 py-1 rounded-lg font-semibold transition"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Big Result Card */}
            <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between">
              <div>
                <div className="text-xs text-amber-300 font-bold uppercase tracking-wide">
                  कांटे पर इतना वजन तौलें:
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                  {calculatedGrams} <span className="text-xl text-amber-400">ग्राम</span>
                </div>
                <div className="text-xs text-stone-300 mt-1">
                  = <strong>{calculatedKg} किलो</strong> (₹{targetMoney} रुपये में @ ₹{rateForMoney}/kg)
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                <Scale className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* Mode 3: Bulk Peti/Bori to Unit Margin */}
        {activeTab === 'bulkConverter' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                सामान का नाम (उदा: पारले-जी पेटी, फॉर्च्यून 12L पेटी, चीनी 50kg बोरी)
              </label>
              <input
                type="text"
                value={bulkItemName}
                onChange={(e) => setBulkItemName(e.target.value)}
                className="w-full text-sm font-semibold px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  पेटी / बोरी की खरीद दर (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  placeholder="उदा: 480"
                  className="w-full text-sm font-bold px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  पेटी में कुल पीस / किलो
                </label>
                <input
                  type="number"
                  min="1"
                  value={bulkUnitsCount}
                  onChange={(e) => setBulkUnitsCount(e.target.value)}
                  placeholder="उदा: 120"
                  className="w-full text-sm font-bold px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                बिक्री मूल्य (MRP प्रति पीस / किलो)
              </label>
              <input
                type="number"
                min="0"
                value={retailMrp}
                onChange={(e) => setRetailMrp(e.target.value)}
                placeholder="उदा: 5"
                className="w-full text-sm font-bold px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900"
              />
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs text-stone-700">
                <span>1 पीस / किलो की खरीद दर (Cost):</span>
                <strong className="text-base text-stone-900 font-black">₹{unitCost}</strong>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-700">
                <span>प्रति पीस मुनाफ़ा (Profit):</span>
                <strong className="text-base text-emerald-800 font-black">+₹{profitPerPiece}</strong>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-700 pt-1 border-t border-emerald-200/60">
                <span>दुकानदार का मार्जिन (Profit %):</span>
                <span className="text-sm bg-emerald-800 text-white font-black px-2 py-0.5 rounded-lg">
                  {marginPercent}% मार्जिन
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
