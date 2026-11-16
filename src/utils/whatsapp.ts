import { Distributor, CartItem, ShopProfile } from '../types';

/**
 * Sanitizes phone number to international WhatsApp format (defaults to India +91 if 10 digits)
 */
export function formatWhatsAppNumber(phone: string): string {
  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Formats a clean, high-clarity Indian Kirana WhatsApp Order Parcha / Slip
 */
export function generateWhatsAppOrderMessage({
  distributor,
  items,
  shopProfile,
  customNote,
  orderNumber,
  targetRecipient = 'distributor'
}: {
  distributor: Distributor;
  items: CartItem[];
  shopProfile: ShopProfile;
  customNote?: string;
  orderNumber?: string;
  targetRecipient?: 'distributor' | 'salesman';
}): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('hi-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.wholesalePrice > 0 ? item.wholesalePrice * item.quantity : 0),
    0
  );

  let message = `🛒 *किराना माल ऑर्डर पर्चा (PURCHASE ORDER)* 📦\n`;
  if (orderNumber) {
    message += `📋 *पर्चा क्र./ID:* #${orderNumber}\n`;
  }
  message += `📅 *दिनांक व समय:* ${dateStr}, ${timeStr}\n\n`;

  if (targetRecipient === 'salesman') {
    const sName = distributor.salesmanName || 'सेल्समैन भाई';
    message += `👤 *नमस्ते ${sName}!* (ऑर्डर बुकर)\n`;
    message += `🏢 *फर्म:* ${distributor.companyName || distributor.name}\n`;
    message += `📌 कृपया हमारी दुकान का आज का माल ऑर्डर बुक कर लें:\n\n`;
  } else {
    message += `👤 *सप्लायर / डिस्ट्रीब्यूटर:* ${distributor.name}\n`;
    if (distributor.companyName) {
      message += `🏢 *फर्म:* ${distributor.companyName}\n`;
    }
    if (distributor.salesmanName) {
      message += `🚶 *सेल्समैन:* ${distributor.salesmanName}\n`;
    }
    message += `\n`;
  }

  message += `🏪 *ऑर्डर देने वाली दुकान:* ${shopProfile.shopName}\n`;
  if (shopProfile.ownerName) {
    message += `👨‍💼 *दुकानदार:* ${shopProfile.ownerName}\n`;
  }
  if (shopProfile.phone) {
    message += `📞 *फोन:* ${shopProfile.phone}\n`;
  }
  if (shopProfile.address) {
    message += `📍 *दुकान का पता:* ${shopProfile.address}\n`;
  }
  message += `\n`;

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📝 *मंगवाए गए सामान की सूची (${items.length} आइटम):*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;

  items.forEach((item, index) => {
    const rateInfo = item.wholesalePrice > 0 
      ? ` (अनुमानित दर: ₹${item.wholesalePrice} | कुल: ₹${item.wholesalePrice * item.quantity})`
      : '';
    const noteInfo = item.customNote ? `\n   ↳ 📌 विशेष: ${item.customNote}` : '';
    
    message += `${index + 1}. *${item.productName}*\n`;
    message += `   ↳ 📦 मात्रा: *${item.quantity} ${item.unit}*${rateInfo}${noteInfo}\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  if (totalAmount > 0) {
    message += `💰 *कुल अनुमानित राशि: ₹${totalAmount.toLocaleString('en-IN')}*\n`;
  }
  message += `📦 *कुल आइटम:* ${items.length} | *कुल नग/मात्रा:* ${items.reduce((s, i) => s + i.quantity, 0)}\n\n`;

  const instruction = customNote || shopProfile.defaultOrderMessage;
  if (instruction) {
    message += `📌 *विशेष निर्देश / डिलीवरी समय:*\n"${instruction}"\n\n`;
  }

  message += `कृपया ऑर्डर कन्फर्म करें और माल की डिलीवरी भिजवाने की कृपा करें।\nधन्यवाद! 🙏`;

  return message;
}

/**
 * Creates the direct WhatsApp link URL
 */
export function createWhatsAppUrl(phoneNumber: string, message: string): string {
  const formattedPhone = formatWhatsAppNumber(phoneNumber);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}
