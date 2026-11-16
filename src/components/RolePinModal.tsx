import React, { useState } from 'react';
import { Lock, KeyRound, X, ShieldCheck, AlertCircle } from 'lucide-react';

interface RolePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
}

export const RolePinModal: React.FC<RolePinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin = '1234'
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (newPin === correctPin) {
          setTimeout(() => {
            onSuccess();
            setPin('');
            onClose();
          }, 200);
        } else {
          setError(true);
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-2">
          <div className="w-8"></div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <button
            onClick={() => {
              setPin('');
              setError(false);
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-black text-stone-900">
          मालिक मोड अनलॉक करें (Owner PIN)
        </h3>
        <p className="text-xs text-stone-500 mt-1 mb-5">
          खरीद भाव और बिल स्कैन देखने के लिए अपना 4-अंकों का पिन दर्ज करें (डिफ़ॉल्ट पिन: 1234)
        </p>

        {/* PIN Dots */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? 'bg-emerald-700 border-emerald-700 scale-110'
                  : 'bg-stone-100 border-stone-300'
              } ${error ? 'bg-red-500 border-red-500 animate-shake' : ''}`}
            />
          ))}
        </div>

        {error && (
          <div className="text-xs text-red-600 font-bold mb-4 flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>गलत पिन! कृपया पुनः प्रयास करें।</span>
          </div>
        )}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mb-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => {
            if (k === '') return <div key={i} />;
            if (k === '⌫') {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={handleBackspace}
                  className="h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-base flex items-center justify-center transition active:scale-95"
                >
                  ⌫
                </button>
              );
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDigit(k)}
                className="h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-lg flex items-center justify-center transition active:scale-95 shadow-2xs"
              >
                {k}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
