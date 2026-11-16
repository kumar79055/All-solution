import React, { useState, useEffect } from 'react';
import { Lock, Crown, X, Delete, ShieldAlert, KeyRound } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctPin: string;
  onSuccess: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  correctPin,
  onSuccess
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setShake(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validPin = correctPin || '1234';

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const verifyPin = (inputPin: string) => {
    if (inputPin === validPin) {
      onSuccess();
      onClose();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin('');
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
      <div className={`bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center animate-in fade-in zoom-in-95 ${
        shake ? 'animate-shake' : ''
      }`}>
        {/* Header icon */}
        <div className="flex justify-between items-start mb-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto shadow-inner border border-amber-200">
            <Crown className="w-6 h-6 text-amber-700" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition -mr-2 -mt-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-black text-stone-900 mb-1">
          मालिक मोड सुरक्षा पिन (Owner PIN)
        </h3>
        <p className="text-xs text-stone-500 mb-5">
          दुकान के खरीद भाव, लाभ और सप्लायर डिटेल्स देखने के लिए 4 अंकों का पिन डालें
        </p>

        {/* 4 Pin Dots Container */}
        <div className="flex justify-center items-center gap-3 mb-4">
          {[0, 1, 2, 3].map((idx) => {
            const hasDigit = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-12 h-14 rounded-2xl flex items-center justify-center text-2xl font-black transition-all ${
                  error
                    ? 'border-2 border-red-500 bg-red-50 text-red-600'
                    : hasDigit
                    ? 'border-2 border-amber-500 bg-amber-50 text-stone-900 shadow-xs'
                    : 'border-2 border-stone-200 bg-stone-50 text-stone-300'
                }`}
              >
                {hasDigit ? '•' : ''}
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {error ? (
          <div className="text-xs font-bold text-red-600 bg-red-50 py-1.5 px-3 rounded-lg mb-4 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>गलत पिन! केवल दुकान मालिक ही खोल सकते हैं</span>
          </div>
        ) : (
          <div className="text-[11px] text-stone-400 mb-4 flex items-center justify-center gap-1">
            <KeyRound className="w-3 h-3 text-stone-400" />
            <span>डिफ़ॉल्ट पिन: <strong>1234</strong></span>
          </div>
        )}

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-13 rounded-2xl bg-stone-100 hover:bg-amber-100/70 text-stone-900 text-xl font-bold transition transform active:scale-95 shadow-2xs border border-stone-200/60"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-500 text-xs font-bold transition active:scale-95 border border-stone-200/60"
          >
            साफ (Clear)
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-13 rounded-2xl bg-stone-100 hover:bg-amber-100/70 text-stone-900 text-xl font-bold transition transform active:scale-95 shadow-2xs border border-stone-200/60"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-13 rounded-2xl bg-stone-100 hover:bg-red-50 text-stone-700 text-sm font-bold flex items-center justify-center transition active:scale-95 border border-stone-200/60"
          >
            <Delete className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="text-xs text-stone-500 hover:text-stone-800 font-semibold underline"
        >
          रद्द करें (वर्कर मोड में ही रहें)
        </button>
      </div>
    </div>
  );
};
