import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  Camera, 
  FileText, 
  Check, 
  AlertCircle, 
  X, 
  ArrowRight, 
  RotateCcw, 
  Building2, 
  CheckSquare, 
  Square,
  IndianRupee,
  Calendar,
  Layers
} from 'lucide-react';
import { Product, Distributor, ScannedBillResult, ScannedBillItem } from '../types';

interface AIBillScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  distributors: Distributor[];
  onApplyBillRates: (updatedItems: {
    productId: string;
    newWholesalePrice: number;
    quantityToAdd?: number;
    mrp?: number;
  }[]) => void;
}

const SAMPLE_BILL_TEXT = `श्री बालाजी एजेंसीज (पारले, ब्रिटानिया व नमकीन)
गोदाम नं. 4, ट्रांसपोर्ट नगर, कानपुर
बिल क्र.: BA/2026/842  दिनांक: 11/11/2026
क्रेता: श्री गणेश किराना स्टोर

सामान का विवरण:
1. Parle-G 5/- पेटी | मात्रा: 5 पेटी | दर: ₹495 प्रति पेटी | कुल: ₹2,475
2. Britannia Good Day 10/- | मात्रा: 3 पेटी | दर: ₹640 प्रति पेटी | कुल: ₹1,920
3. Fortune Refined Soyabean Oil 1L | मात्रा: 4 पेटी | दर: ₹1,590 प्रति पेटी | कुल: ₹6,360
4. MDH Deggi Mirch 100g | मात्रा: 2 दर्जन | दर: ₹1,020 प्रति दर्जन | कुल: ₹2,040
5. Tata Salt 1kg बोरी | मात्रा: 2 बोरी | दर: ₹635 प्रति बोरी | कुल: ₹1,270

कुल बिल राशि: ₹14,065
हस्ताक्षर सप्लायर`;

export const AIBillScannerModal: React.FC<AIBillScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  distributors,
  onApplyBillRates
}) => {
  const [inputTab, setInputTab] = useState<'upload' | 'text'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [billText, setBillText] = useState<string>('');
  
  // Scan status
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<ScannedBillResult | null>(null);

  // User selections on scanned items
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({});
  const [matchedProducts, setMatchedProducts] = useState<Record<number, string>>({});
  const [addStockFlags, setAddStockFlags] = useState<Record<number, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setScanError(null);
  };

  const handleScanBill = async () => {
    if (!selectedFile && !billText.trim()) {
      setScanError('कृपया बिल की फोटो चुनें या बिल का टेक्स्ट लिखें।');
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      let bodyData: any = {
        existingProducts: products.map(p => ({
          id: p.id,
          name: p.name,
          hindiName: p.hindiName,
          wholesalePrice: p.wholesalePrice,
          unit: p.unit
        }))
      };

      if (inputTab === 'upload' && previewUrl) {
        bodyData.imageBase64 = previewUrl;
        bodyData.mimeType = selectedFile?.type || 'image/jpeg';
      } else {
        bodyData.billText = billText;
      }

      const res = await fetch('/api/scan-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'बिल स्कैन करने में समस्या आई।');
      }

      const result: ScannedBillResult = json.data;
      setScannedResult(result);

      // Initialize selection states
      const initialSelected: Record<number, boolean> = {};
      const initialMatches: Record<number, string> = {};
      const initialStock: Record<number, boolean> = {};

      result.items.forEach((item, idx) => {
        initialSelected[idx] = true;
        initialStock[idx] = true; // default also add stock

        // Try to match with existing product
        let foundId = item.matchedProductId || '';
        if (!foundId) {
          const lowerBillName = item.rawItemName.toLowerCase();
          const match = products.find(p => 
            lowerBillName.includes(p.name.toLowerCase()) || 
            p.name.toLowerCase().includes(lowerBillName) ||
            (p.hindiName && lowerBillName.includes(p.hindiName.toLowerCase()))
          );
          if (match) foundId = match.id;
        }

        initialMatches[idx] = foundId;
      });

      setSelectedItems(initialSelected);
      setMatchedProducts(initialMatches);
      setAddStockFlags(initialStock);
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || 'बिल स्कैन करने में त्रुटि हुई। कृपया दोबारा प्रयास करें।');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyChanges = () => {
    if (!scannedResult) return;

    const updatesToApply: {
      productId: string;
      newWholesalePrice: number;
      quantityToAdd?: number;
      mrp?: number;
    }[] = [];

    scannedResult.items.forEach((item, idx) => {
      const isSelected = selectedItems[idx];
      const prodId = matchedProducts[idx];

      if (isSelected && prodId) {
        updatesToApply.push({
          productId: prodId,
          newWholesalePrice: item.newWholesalePrice,
          quantityToAdd: addStockFlags[idx] ? item.quantity : 0,
          mrp: item.mrp && item.mrp > 0 ? item.mrp : undefined
        });
      }
    });

    if (updatesToApply.length === 0) {
      alert('कृपया कम से कम एक सामान को मौजूदा लिस्ट से लिंक करें।');
      return;
    }

    onApplyBillRates(updatesToApply);
    onClose();
  };

  const handleToggleSelectAll = (select: boolean) => {
    if (!scannedResult) return;
    const updated: Record<number, boolean> = {};
    scannedResult.items.forEach((_, idx) => {
      updated[idx] = select;
    });
    setSelectedItems(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-stone-200 my-4 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-stone-900 leading-tight">
                  एआई बिल स्कैनर (AI Bill Scanner)
                </h3>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  मालिक मोड
                </span>
              </div>
              <p className="text-xs text-stone-500">
                थोक बिल की फोटो अपलोड करें — AI खरीद दरें पहचानकर दुकान के स्टॉक में तुरंत बदल देगा
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Step 1: Input selection (only if not scanned yet) */}
          {!scannedResult && (
            <div className="space-y-4">
              {/* Input Type Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setInputTab('upload')}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                    inputTab === 'upload'
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>बिल की फोटो या PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInputTab('text')}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                    inputTab === 'text'
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>व्हाट्सएप या लिखा हुआ बिल</span>
                </button>
              </div>

              {/* Tab 1: Upload / Camera */}
              {inputTab === 'upload' && (
                <div className="space-y-3">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition ${
                      previewUrl ? 'border-emerald-400 bg-emerald-50/20' : 'border-stone-300 hover:border-emerald-500 bg-stone-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {previewUrl ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={previewUrl} 
                          alt="Bill Preview" 
                          className="max-h-56 rounded-xl shadow-md border border-stone-200 mb-3 object-contain"
                        />
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                          ✓ बिल फोटो लोड हो गई (बदलने के लिए क्लिक करें)
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                          <Upload className="w-7 h-7" />
                        </div>
                        <h4 className="text-sm font-bold text-stone-800 mb-1">
                          बिल / चालान की फोटो चुनें या कैमरा से खींचें
                        </h4>
                        <p className="text-xs text-stone-500 max-w-sm">
                          सप्लायर का बिल, पर्चा या कम्प्यूटराइज्ड इनवॉइस (JPG, PNG) यहां अपलोड करें
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Text paste */}
              {inputTab === 'text' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-700">
                    सप्लायर का व्हाट्सएप मैसेज या बिल का टेक्स्ट पेस्ट करें:
                  </label>
                  <textarea
                    rows={6}
                    value={billText}
                    onChange={(e) => setBillText(e.target.value)}
                    placeholder="उदा:&#10;1. Parle-G ₹5 - 5 पेटी @ 495&#10;2. Fortune Oil 1L - 4 पेटी @ 1590&#10;3. MDH Mirch - 2 दर्जन @ 1020"
                    className="w-full text-xs sm:text-sm font-mono border border-stone-300 rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-stone-50"
                  />
                </div>
              )}

              {/* Sample Bill Quick Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setInputTab('text');
                    setBillText(SAMPLE_BILL_TEXT);
                    setScanError(null);
                  }}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>⚡ नमूना बिल (Demo Bill) लोड करके टेस्ट करें</span>
                </button>

                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    फोटो हटाएं
                  </button>
                )}
              </div>

              {scanError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Scan Trigger Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isScanning || (!previewUrl && !billText.trim())}
                  onClick={handleScanBill}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                    isScanning || (!previewUrl && !billText.trim())
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white active:scale-98'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>एआई बिल पढ़ रहा है (कृपया प्रतीक्षा करें)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>🤖 बिल स्कैन करें और खरीद रेट निकालें</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Review Scanned Rates & Apply */}
          {scannedResult && (
            <div className="space-y-4">
              {/* Header card with Bill meta */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    पहचाना गया सप्लायर / बिल विवरण:
                  </span>
                  <div className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    <span>{scannedResult.distributorName || 'थोक विक्रेता (Wholesale Supplier)'}</span>
                  </div>
                  <div className="text-xs text-stone-600 flex flex-wrap items-center gap-3 mt-0.5">
                    {scannedResult.invoiceNumber && <span>बिल क्र.: <strong>#{scannedResult.invoiceNumber}</strong></span>}
                    {scannedResult.invoiceDate && <span>दिनांक: <strong>{scannedResult.invoiceDate}</strong></span>}
                    {scannedResult.totalBillAmount && (
                      <span className="font-bold text-emerald-800">
                        कुल राशि: ₹{scannedResult.totalBillAmount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setScannedResult(null);
                    setScanError(null);
                  }}
                  className="text-xs font-bold text-stone-600 bg-white hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>दूसरा बिल स्कैन करें</span>
                </button>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>पहचाने गए सामान व खरीद भाव ({scannedResult.items.length})</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectAll(true)}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline"
                    >
                      सभी चुनें
                    </button>
                    <span className="text-stone-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleToggleSelectAll(false)}
                      className="text-[11px] font-semibold text-stone-500 hover:underline"
                    >
                      हटाएं
                    </button>
                  </div>
                </div>

                <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100">
                  {scannedResult.items.map((item, idx) => {
                    const isChecked = selectedItems[idx] ?? true;
                    const matchedId = matchedProducts[idx] || '';
                    const matchedProd = products.find(p => p.id === matchedId);
                    const oldRate = matchedProd?.wholesalePrice || 0;
                    const newRate = item.newWholesalePrice;
                    const diff = oldRate > 0 ? newRate - oldRate : 0;

                    return (
                      <div 
                        key={idx}
                        className={`p-3.5 transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          isChecked ? 'bg-white' : 'bg-stone-50/80 opacity-60'
                        }`}
                      >
                        {/* Checkbox and item info */}
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => setSelectedItems(prev => ({ ...prev, [idx]: !prev[idx] }))}
                            className="mt-0.5 text-emerald-700 flex-shrink-0"
                          >
                            {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-stone-400" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                              <span>{item.rawItemName}</span>
                              <span className="text-[11px] text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded font-mono">
                                {item.quantity} {item.unit}
                              </span>
                            </div>

                            {/* Match Selector */}
                            <div className="mt-1 flex items-center gap-1.5 text-xs">
                              <span className="text-stone-500 text-[11px] font-semibold flex-shrink-0">
                                दुकान का सामान:
                              </span>
                              <select
                                value={matchedId}
                                onChange={(e) => setMatchedProducts(prev => ({ ...prev, [idx]: e.target.value }))}
                                className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[260px] truncate"
                              >
                                <option value="">-- मैच नहीं मिला (नया सामान) --</option>
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} (मौजूदा रेट: ₹{p.wholesalePrice})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Rate comparison */}
                        <div className="flex items-center justify-between md:justify-end gap-4 pl-7 md:pl-0">
                          <div className="text-right">
                            <span className="text-[10px] text-stone-400 block">पुरानी खरीद दर</span>
                            <span className="text-xs font-bold text-stone-600">
                              {oldRate > 0 ? `₹${oldRate}` : 'नई एंट्री'}
                            </span>
                          </div>

                          <ArrowRight className="w-3.5 h-3.5 text-stone-300" />

                          <div className="text-right min-w-[90px]">
                            <span className="text-[10px] text-emerald-800 font-bold block">नई खरीद दर</span>
                            <div className="flex items-center gap-1.5 justify-end">
                              <span className="text-base font-black text-emerald-900">
                                ₹{newRate}
                              </span>
                              {diff !== 0 && oldRate > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  diff > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {diff > 0 ? `+₹${diff}` : `-₹${Math.abs(diff)}`}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Add stock checkbox */}
                          <label className="flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-1 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={addStockFlags[idx] ?? true}
                              onChange={(e) => setAddStockFlags(prev => ({ ...prev, [idx]: e.target.checked }))}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>+{item.quantity} स्टॉक जोड़ें</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-stone-600">
                  चुने गए आइटम की खरीद दर दुकान में स्वतः अपडेट हो जाएगी।
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
                  >
                    रद्द करें
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyChanges}
                    className="px-6 py-2.5 text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>नई खरीद दरें लागू करें (Apply Rates)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
