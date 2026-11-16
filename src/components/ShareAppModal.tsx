import React, { useState, useRef } from 'react';
import {
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  X,
  AlertCircle,
  Globe,
} from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
  sharedAppUrl?: string;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  appUrl,
  sharedAppUrl = 'https://ais-pre-mrugqyepf5sfhjllykbd2f-652479634211.asia-southeast1.run.app',
}) => {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Always prefer the live running origin so the link actually opens a real page
  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : '';
  const liveUrl = currentOrigin || appUrl || sharedAppUrl;
  const isDevPreview = liveUrl.includes('ais-dev-');

  const handleCopy = () => {
    const fallbackCopy = () => {
      if (inputRef.current) {
        inputRef.current.select();
        inputRef.current.setSelectionRange(0, 99999);
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          // ignore
        }
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(liveUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  };

  const whatsappText = encodeURIComponent(
    `🏪 किराना ऑर्डर साथी ऐप लिंक:\n${liveUrl}\n\n(इसे मोबाइल के Google Chrome में खोलें और 3 डॉट्स ⋮ दबाकर 'Add to Home screen' करें)`
  );
  const whatsappShareHref = `https://wa.me/?text=${whatsappText}`;

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
                मोबाइल / फोन पर कैसे चलाएं?
              </h3>
              <p className="text-xs text-stone-500">
                Open &amp; Install on Mobile Phone, Tablet or Other PC
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
        <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 mb-4">
          <div className="text-xs font-bold text-emerald-950 mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>अभी चालू लाइव लिंक (Working Link):</span>
            </span>
            <span className="text-[10px] text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
              ✅ चालू है
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white border border-emerald-300 rounded-xl p-2 shadow-inner">
            <input
              ref={inputRef}
              type="text"
              readOnly
              value={liveUrl}
              onClick={(e) => e.currentTarget.select()}
              className="flex-1 text-xs sm:text-sm font-mono text-stone-800 select-all bg-transparent focus:outline-none min-w-0"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition whitespace-nowrap"
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

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white border border-emerald-300 hover:bg-emerald-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>नए टैब में खोलकर चेक करें</span>
            </a>
          </div>
        </div>

        {/* WhatsApp Share Anchor (more reliable than window.open inside iframes) */}
        <div className="mb-4">
          <a
            href={whatsappShareHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black py-3 px-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm transform active:scale-98"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>📲 अपने WhatsApp पर यह लिंक भेजें (Send to Phone)</span>
          </a>
          <p className="text-[11px] text-stone-500 text-center mt-1.5">
            WhatsApp पर भेजकर अपने फोन में लिंक दबाएं और <strong>Google Chrome</strong> में खोलें।
          </p>
        </div>

        {/* Important Troubleshooting Box for ais-dev vs ais-pre */}
        {isDevPreview && (
          <div className="mb-4 bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-xs text-stone-800 space-y-1.5">
            <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>फोन पर खोलते समय 2 जरूरी बातें (ध्यान दें):</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-stone-700">
              <li>
                <strong>वही Google अकाउंट:</strong> फोन के Chrome ब्राउज़र में वही Gmail लॉगिन होना चाहिए जिससे आप कंप्यूटर पर Google AI Studio चला रहे हैं (क्योंकि यह आपका प्राइवेट लाइव प्रीव्यू लिंक है)।
              </li>
              <li>
                <strong>बिना लॉगिन (पब्लिक / वर्कर के फोन) के लिए:</strong> AI Studio में ऊपर दाईं ओर <strong>Share / Deploy</strong> बटन दबाकर ऐप को पब्लिश करें — उसके बाद जो <code className="bg-amber-100 px-1 rounded">ais-pre-...</code> लिंक बनेगा वह बिना लॉगिन के हर फोन पर 24 घंटे खुलेगा।
              </li>
            </ul>
          </div>
        )}

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
                ऊपर दिए गए लिंक को अपने फोन के <strong>Google Chrome</strong> या Safari ब्राउज़र में खोलें। (WhatsApp के अंदर न खोलें — ऊपर 3 डॉट दबाकर <em>"Open in Chrome"</em> चुनें)।
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
                वहां <strong>&quot;Add to Home screen&quot; (होम स्क्रीन में जोड़ें)</strong> या <strong>&quot;Install app&quot;</strong> चुनें।
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 text-[11px] text-emerald-800 font-semibold bg-emerald-50/70 p-2 rounded-xl">
            💡 <strong>सुझाव:</strong> आपके फोन की होम स्क्रीन पर &quot;किराना साथी&quot; का ऐप आइकन बन जाएगा!
          </div>
        </div>

        {/* Data Sync info */}
        <div className="mt-3 p-3 bg-stone-100 rounded-2xl border border-stone-200 text-xs text-stone-700">
          <strong>💾 डेस्कटॉप का डेटा मोबाइल में कैसे लाएं?</strong>
          <p className="text-[11px] text-stone-600 mt-1">
            डेस्कटॉप पर <strong>दुकान सेटिंग (⚙️)</strong> में जाकर <strong>&quot;बैकअप डाउनलोड&quot;</strong> करें। वह फाइल अपने मोबाइल पर WhatsApp भेजें, फिर मोबाइल में ऐप खोलकर <strong>&quot;बैकअप लोड करें&quot;</strong> दबाएं।
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-4 pt-3 border-t border-stone-200 text-right">
          <button
            type="button"
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
