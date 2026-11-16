import React, { useState } from 'react';
import { Smartphone, Copy, Check, ExternalLink, MessageCircle, X, QrCode, Share2 } from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  appUrl
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const liveUrl = appUrl || window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareToWhatsApp = () => {
    const text = encodeURIComponent(
      `🏪 किराना ऑर्डर साथी ऐप लिंक:\n${liveUrl}\n\n(इसे फोन के Chrome में खोलें और 3 डॉट्स दबाकर 'Add to Home screen' करें)`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-md">
              <Smartphone className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 leading-tight">
                मोबाइल या दूसरे कंप्यूटर पर कैसे खोलें?
              </h3>
              <p className="text-xs text-stone-500">
                Login on Mobile Phone, Tablet or Other Device
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

        {/* Live URL Box */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 mb-4">
          <label className="block text-xs font-bold text-emerald-950 mb-1.5 flex items-center justify-between">
            <span>🌐 आपका स्थायी लाइव ऐप लिंक (Permanent Link):</span>
            <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold">24x7 एक्टिव</span>
          </label>

          <div className="flex items-center gap-2 bg-white border border-emerald-300 rounded-xl p-2 shadow-inner">
            <input
              type="text"
              readOnly
              value={liveUrl}
              className="flex-1 text-xs sm:text-sm font-mono text-stone-800 select-all bg-transparent focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>कॉपी हुआ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>कॉपी करें</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* WhatsApp Share Button */}
        <div className="mb-5">
          <button
            onClick={handleShareToWhatsApp}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black py-3 px-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm transform active:scale-98"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>📲 अपने WhatsApp पर यह लिंक भेजें (Send to My Phone)</span>
          </button>
          <p className="text-[11px] text-stone-500 text-center mt-1">
            व्हाट्सएप पर भेजकर अपने फोन में लिंक पर क्लिक करें और तुरंत चालू करें।
          </p>
        </div>

        {/* Easy 3-step Instructions */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
          <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wide">
            📱 फोन में ऐप (App Icon) की तरह कैसे चलाएं:
          </h4>

          <div className="space-y-2 text-xs text-stone-700">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </span>
              <span>
                ऊपर दिए गए लिंक को अपने फोन के <strong>Google Chrome</strong> या Safari ब्राउज़र में खोलें।
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </span>
              <span>
                Chrome में ऊपर दाईं ओर <strong>तीन बिंदी (⋮)</strong> पर क्लिक करें।
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </span>
              <span>
                वहां <strong>"Add to Home screen" (होम स्क्रीन में जोड़ें)</strong> या <strong>"Install app"</strong> चुनें।
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 text-[11px] text-emerald-800 font-semibold bg-emerald-50/70 p-2 rounded-xl">
            💡 <strong>सुझाव:</strong> आपके फोन की होम स्क्रीन पर "किराना साथी" का असली ऐप आइकन बन जाएगा। अगली बार बस उस आइकन को दबाएं और दुकान का काम शुरू करें!
          </div>
        </div>

        {/* Data Sync info */}
        <div className="mt-4 p-3 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-stone-700">
          <strong>💾 डेस्कटॉप का डेटा मोबाइल में कैसे लाएं?</strong>
          <p className="text-[11px] text-stone-600 mt-1">
            डेस्कटॉप पर <strong>दुकान सेटिंग (⚙️)</strong> में जाकर <strong>"बैकअप डाउनलोड"</strong> करें। वह फाइल अपने मोबाइल पर WhatsApp भेजें, फिर मोबाइल में ऐप खोलकर <strong>"बैकअप लोड करें"</strong> दबाएं।
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t border-stone-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition"
          >
            समझ गया (बंद करें)
          </button>
        </div>
      </div>
    </div>
  );
};
