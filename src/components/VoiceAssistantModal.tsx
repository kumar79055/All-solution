import React, { useState, useEffect, useRef } from 'react';
import { Product, Distributor, UnitType } from '../types';
import { parseVoiceInput, VoiceParsedResult } from '../utils/voiceParser';
import { 
  Mic, 
  MicOff, 
  X, 
  ShoppingCart, 
  Search, 
  Check, 
  Sparkles, 
  Plus, 
  Minus, 
  Truck, 
  Volume2,
  AlertCircle
} from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  distributors: Distributor[];
  onAddToCart: (product: Product, quantity: number, customUnit?: string) => void;
  onSearch: (searchTerm: string) => void;
  onAddNewProductWithName: (name: string, quantity?: number, unit?: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  products,
  distributors,
  onAddToCart,
  onSearch,
  onAddNewProductWithName
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lang, setLang] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [parsedResult, setParsedResult] = useState<VoiceParsedResult | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('पेटी (Carton/Box)');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Map distributors
  const distributorMap = new Map<string, Distributor>();
  distributors.forEach(d => distributorMap.set(d.id, d));

  const isSpeechSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize and start listening when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      return;
    }

    setTranscript('');
    setParsedResult(null);
    setSelectedProduct(null);
    setErrorMessage(null);

    if (isSpeechSupported) {
      startListening();
    }
  }, [isOpen, lang]);

  const startListening = () => {
    setErrorMessage(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('आपके ब्राउज़र में आवाज़ पहचान (Speech Recognition) समर्थित नहीं है। आप नीचे लिखकर टेस्ट कर सकते हैं।');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(currentTranscript);

        if (event.results[0].isFinal) {
          handleProcessText(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक चालू करें।');
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`आवाज़ पकड़ने में समस्या: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
      setErrorMessage('माइक चालू करने में त्रुटि हुई।');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleProcessText = (text: string) => {
    if (!text.trim()) return;
    const result = parseVoiceInput(text, products);
    setParsedResult(result);

    if (result.matchedProduct) {
      setSelectedProduct(result.matchedProduct);
      setQuantity(result.quantity);
      setUnit(result.unit || result.matchedProduct.unit);
    } else {
      setSelectedProduct(null);
      setQuantity(result.quantity);
      setUnit(result.unit);
    }
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProduct) return;
    onAddToCart(selectedProduct, quantity, unit);
    onClose();
  };

  const handleSearchAction = (term: string) => {
    onSearch(term);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 flex items-center justify-center shadow-md">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 leading-tight">
                बोलकर सामान जोड़ें या खोजें
              </h3>
              <p className="text-xs text-stone-500">
                Voice Assistant (हिंदी या हिंग्लिश में बोलें)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switch */}
            <button
              onClick={() => {
                const nextLang = lang === 'hi-IN' ? 'en-IN' : 'hi-IN';
                setLang(nextLang);
              }}
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
              title="भाषा बदलें"
            >
              {lang === 'hi-IN' ? '🇮🇳 हिंदी' : '🌐 English'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Mic Animation & Listening Status */}
        <div className="text-center py-4">
          <div className="relative inline-block">
            {isListening && (
              <span className="absolute -inset-3 rounded-full bg-red-400/30 animate-ping"></span>
            )}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition transform active:scale-95 ${
                isListening
                  ? 'bg-red-600 text-white ring-4 ring-red-200'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
              title={isListening ? 'रोकें' : 'माइक शुरू करें'}
            >
              {isListening ? (
                <Mic className="w-9 h-9 animate-bounce" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </button>
          </div>

          <p className="text-sm font-extrabold mt-3 text-stone-800">
            {isListening ? (
              <span className="text-red-600 flex items-center justify-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                ध्यान से सुन रहे हैं... अभी बोलिए
              </span>
            ) : (
              <span className="text-stone-600">
                बोलने के लिए माइक पर क्लिक करें
              </span>
            )}
          </p>

          {/* Spoken Text Display */}
          <div className="mt-3 bg-stone-50 border border-stone-200 rounded-2xl p-3 text-sm text-stone-900 min-h-[50px] flex items-center justify-center text-center font-medium">
            {transcript ? (
              <span className="font-bold text-stone-900 text-base">"{transcript}"</span>
            ) : (
              <span className="text-stone-400 text-xs">
                उदा: "पारले जी 2 पेटी जोड़ो" या "फॉर्च्यून तेल खोजो"
              </span>
            )}
          </div>

          {errorMessage && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-1.5 justify-center">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Parsed Result Display */}
        {parsedResult && (
          <div className="mt-2 pt-3 border-t border-stone-200">
            {parsedResult.action === 'search' ? (
              // Search intent detected
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
                <Search className="w-6 h-6 text-blue-600 mx-auto mb-1.5" />
                <h4 className="font-bold text-stone-900 text-sm">
                  "{parsedResult.searchTerm}" को दुकान में खोजें
                </h4>
                <p className="text-xs text-stone-600 mb-3">
                  सामान लिस्ट में इस शब्द से जुड़े सभी आइटम दिखाएं
                </p>
                <button
                  onClick={() => handleSearchAction(parsedResult.searchTerm)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow transition text-sm flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>खोजें (Search Now)</span>
                </button>
              </div>
            ) : selectedProduct ? (
              // Product Matched Successfully
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>सामान मिल गया (Product Matched)</span>
                </div>

                <div className="bg-white rounded-xl p-3 border border-emerald-200 shadow-2xs mb-3">
                  <h4 className="font-extrabold text-stone-900 text-base">
                    {selectedProduct.name}
                  </h4>
                  {selectedProduct.hindiName && (
                    <p className="text-xs text-stone-500">{selectedProduct.hindiName}</p>
                  )}

                  <div className="mt-1 flex items-center gap-2 text-xs text-stone-600">
                    <span className="flex items-center gap-1 font-semibold text-emerald-900">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      {distributorMap.get(selectedProduct.distributorId)?.name || 'डिस्ट्रीब्यूटर'}
                    </span>
                    <span>• दर: ₹{selectedProduct.wholesalePrice}</span>
                  </div>
                </div>

                {/* Quantity & Unit Adjuster */}
                <div className="flex items-center justify-between gap-3 bg-white/70 p-2.5 rounded-xl border border-emerald-100 mb-3">
                  <span className="text-xs font-bold text-stone-700">मात्रा व इकाई:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-stone-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-1 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-l-lg"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-stone-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-1 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-r-lg"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                      {unit}
                    </span>
                  </div>
                </div>

                {/* Add To Cart Button */}
                <button
                  onClick={handleConfirmAddToCart}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2 active:scale-98"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>पर्चे (Cart) में जोड़ें</span>
                </button>
              </div>
            ) : (
              // No exact product matched, show suggestions or create new
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  दुकान की लिस्ट में यह नाम नहीं मिला
                </h4>
                <p className="text-xs text-stone-600 mb-3">
                  आप नीचे दिए गए मिलते-जुलते सामान में से चुन सकते हैं, या इसे नया सामान बना सकते हैं:
                </p>

                {parsedResult.suggestedProducts.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {parsedResult.suggestedProducts.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setUnit(p.unit);
                        }}
                        className="w-full text-left bg-white hover:bg-amber-100/60 border border-amber-200 rounded-xl p-2.5 text-xs flex items-center justify-between transition"
                      >
                        <div>
                          <span className="font-bold text-stone-900">{p.name}</span>
                          <span className="text-stone-500 block text-[11px]">
                            {distributorMap.get(p.distributorId)?.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          चुनें
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onAddNewProductWithName(parsedResult.searchTerm, quantity, unit);
                      onClose();
                    }}
                    className="flex-1 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ नया सामान बनाकर जोड़ें</span>
                  </button>

                  <button
                    onClick={() => handleSearchAction(parsedResult.searchTerm)}
                    className="bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold py-2.5 px-3 rounded-xl transition flex items-center gap-1"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>सर्च करें</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Example Chips */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
            💡 बोलकर यह कहकर देखें:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              'पारले जी 2 पेटी',
              'फॉर्च्यून तेल 3 पेटी',
              'टाटा नमक 1 बोरी',
              'एमडीएच मिर्च 5 पैकेट',
              'सर्फ एक्सेल खोजो'
            ].map(example => (
              <button
                key={example}
                onClick={() => {
                  setTranscript(example);
                  handleProcessText(example);
                }}
                className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-lg transition"
              >
                🗣️ "{example}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
