import { Product, UnitType } from '../types';

// Hindi and English numeral word mappings
const NUM_WORDS: Record<string, number> = {
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5,
  'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15,
  'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19, 'बीस': 20,
  'पच्चीस': 25, 'तीस': 30, 'चालीस': 40, 'पचास': 50,
  'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5, 'panch': 5,
  'che': 6, 'chhe': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'fifteen': 15, 'twenty': 20, 'twenty-five': 25, 'fifty': 50
};

// Unit keywords mapping
const UNIT_MAPPINGS: { keywords: string[]; unit: UnitType }[] = [
  {
    keywords: ['पेटी', 'पेटियां', 'पेटीयां', 'peti', 'petiyan', 'carton', 'cartons', 'box', 'boxes'],
    unit: 'पेटी (Carton/Box)'
  },
  {
    keywords: ['बोरी', 'बोरियां', 'कट्टा', 'कट्टे', 'bori', 'boriyan', 'katta', 'katte', 'bag', 'bags', 'sack', 'sacks'],
    unit: 'बोरी / कट्टा (Sack/Bag)'
  },
  {
    keywords: ['पैकेट', 'पैकेटें', 'packet', 'packets', 'pkt', 'pkts', 'pouch', 'pouches'],
    unit: 'पैकेट (Packet)'
  },
  {
    keywords: ['डिब्बा', 'डिब्बे', 'tin', 'tins', 'jar', 'jars', 'dibba', 'dibbe'],
    unit: 'डिब्बा (Tin/Jar)'
  },
  {
    keywords: ['दर्जन', 'dozen', 'darjan'],
    unit: 'दर्जन (Dozen)'
  },
  {
    keywords: ['लीटर', 'litre', 'liter', 'litres', 'liters', 'ltr'],
    unit: 'लीटर (Litre)'
  },
  {
    keywords: ['किलो', 'किलोग्राम', 'kg', 'kilo', 'kilogram'],
    unit: 'किलो (Kg)'
  },
  {
    keywords: ['पीस', 'नग', 'piece', 'pieces', 'pc', 'pcs', 'nag'],
    unit: 'पीस / नग (Piece)'
  }
];

export interface VoiceParsedResult {
  action: 'add' | 'search';
  rawText: string;
  matchedProduct: Product | null;
  suggestedProducts: Product[];
  quantity: number;
  unit: UnitType | string;
  searchTerm: string;
  confidence: number;
}

/**
 * Parses spoken speech text into structured Kirana cart action or search
 */
export function parseVoiceInput(spokenText: string, products: Product[]): VoiceParsedResult {
  const clean = spokenText.trim().toLowerCase();
  
  // Check if intent is clearly search
  const isSearchIntent = 
    clean.includes('सर्च') || 
    clean.includes('search') || 
    clean.includes('खोजो') || 
    clean.includes('दिखाओ') || 
    clean.includes('ढूंढो') ||
    clean.startsWith('find');

  // Remove common filler words
  let text = clean
    .replace(/(सर्च|search|खोजो|दिखाओ|ढूंढो|find)/gi, '')
    .replace(/(जोड़ो|डालो|मंगाओ|मंगवाओ|लिखो|add|order)/gi, '')
    .replace(/(चाहिए|karo|करो|de do|दे दो|lao|लाओ)/gi, '')
    .trim();

  // Extract quantity (digit or written number words)
  let quantity = 1;
  let unit: UnitType = 'पेटी (Carton/Box)';
  let unitFound = false;

  // Try finding numeric digits (e.g. "2", "10")
  const digitMatch = text.match(/\b(\d+)\b/);
  if (digitMatch) {
    quantity = parseInt(digitMatch[1], 10);
    text = text.replace(digitMatch[0], ' ').trim();
  } else {
    // Try word numerals
    const words = text.split(/\s+/);
    for (const word of words) {
      if (NUM_WORDS[word]) {
        quantity = NUM_WORDS[word];
        text = text.replace(new RegExp(`\\b${word}\\b`, 'i'), ' ').trim();
        break;
      }
    }
  }

  // Extract unit
  for (const mapping of UNIT_MAPPINGS) {
    for (const kw of mapping.keywords) {
      const reg = new RegExp(`\\b${kw}\\b`, 'i');
      if (reg.test(text)) {
        unit = mapping.unit;
        unitFound = true;
        text = text.replace(reg, ' ').trim();
        break;
      }
    }
    if (unitFound) break;
  }

  // Clean remainder as product search phrase
  const searchPhrase = text.replace(/\s+/g, ' ').trim();

  // Score products based on searchPhrase
  const scored = products.map(prod => {
    let score = 0;
    const nameLower = prod.name.toLowerCase();
    const hindiLower = (prod.hindiName || '').toLowerCase();
    const catLower = prod.category.toLowerCase();

    // Exact matches
    if (nameLower === searchPhrase || hindiLower === searchPhrase) {
      score += 100;
    } else if (nameLower.includes(searchPhrase) || hindiLower.includes(searchPhrase)) {
      score += 60;
    } else {
      // Word overlap score
      const searchTokens = searchPhrase.split(' ').filter(t => t.length > 1);
      for (const token of searchTokens) {
        if (nameLower.includes(token)) score += 20;
        if (hindiLower.includes(token)) score += 20;
        if (catLower.includes(token)) score += 10;
      }
    }

    return { product: prod, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const matchedProduct = scored[0] && scored[0].score >= 20 ? scored[0].product : null;
  const suggestedProducts = scored
    .filter(s => s.score >= 10)
    .slice(0, 4)
    .map(s => s.product);

  // If matched product has a specific default unit and user didn't specify unit, inherit product's unit
  if (matchedProduct && !unitFound) {
    unit = matchedProduct.unit as UnitType;
  }

  return {
    action: isSearchIntent ? 'search' : 'add',
    rawText: spokenText,
    matchedProduct,
    suggestedProducts,
    quantity,
    unit,
    searchTerm: searchPhrase || spokenText,
    confidence: scored[0]?.score || 0
  };
}
