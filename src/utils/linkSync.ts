import { CartItem, Distributor, OrderRecord, Product, ShopProfile } from '../types';
import { INITIAL_DISTRIBUTORS, INITIAL_PRODUCTS } from '../data/initialData';

export interface LinkStorePayload {
  shopId: string;
  distributors: Distributor[];
  products: Product[];
  cart: CartItem[];
  orders: OrderRecord[];
  shopProfile: ShopProfile;
  updatedAt: number;
}

function uint8ToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUint8(str: string): Uint8Array<ArrayBuffer> {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const initialDistMap = new Map<string, Distributor>(
  INITIAL_DISTRIBUTORS.map((d) => [d.id, d])
);
const initialProdMap = new Map<string, Product>(
  INITIAL_PRODUCTS.map((p) => [p.id, p])
);

function isSameDistributor(a: Distributor, b: Distributor): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.companyName === b.companyName &&
    a.whatsappNumber === b.whatsappNumber &&
    (a.salesmanName || '') === (b.salesmanName || '') &&
    (a.salesmanPhone || '') === (b.salesmanPhone || '') &&
    (a.alternatePhone || '') === (b.alternatePhone || '') &&
    a.category === b.category &&
    JSON.stringify(a.deliveryDays || []) === JSON.stringify(b.deliveryDays || []) &&
    (a.upiId || '') === (b.upiId || '') &&
    (a.address || '') === (b.address || '') &&
    (a.notes || '') === (b.notes || '')
  );
}

function isSameProduct(a: Product, b: Product): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    (a.hindiName || '') === (b.hindiName || '') &&
    a.distributorId === b.distributorId &&
    a.category === b.category &&
    a.currentStock === b.currentStock &&
    a.minStockAlert === b.minStockAlert &&
    a.unit === b.unit &&
    a.wholesalePrice === b.wholesalePrice &&
    (a.mrp || 0) === (b.mrp || 0)
  );
}

function buildCompactObject(payload: LinkStorePayload, includeOrders: boolean) {
  const sp = payload.shopProfile;
  const dl = payload.distributors.map((d) => {
    const init = initialDistMap.get(d.id);
    if (init && isSameDistributor(d, init)) {
      return d.id;
    }
    return [
      d.id,
      d.name,
      d.companyName,
      d.whatsappNumber,
      d.salesmanName || '',
      d.salesmanPhone || '',
      d.alternatePhone || '',
      d.category,
      d.deliveryDays || [],
      d.upiId || '',
      d.address || '',
      d.notes || '',
    ];
  });

  const pl = payload.products.map((p) => {
    const init = initialProdMap.get(p.id);
    if (init && isSameProduct(p, init)) {
      return p.id;
    }
    return [
      p.id,
      p.name,
      p.hindiName || '',
      p.distributorId,
      p.category,
      p.currentStock,
      p.minStockAlert,
      p.unit,
      p.wholesalePrice,
      p.mrp || 0,
    ];
  });

  const cl = payload.cart.map((c) => [
    c.productId,
    c.productName,
    c.distributorId,
    c.quantity,
    c.unit,
    c.wholesalePrice,
    c.mrp || 0,
    c.customNote || '',
    c.isCustomItem ? 1 : 0,
  ]);

  return {
    v: 2,
    s: payload.shopId,
    u: payload.updatedAt || Date.now(),
    sp: [
      sp.shopName || '',
      sp.ownerName || '',
      sp.phone || '',
      sp.address || '',
      sp.gstNumber || '',
      sp.defaultOrderMessage || '',
      sp.ownerPin || '1234',
    ],
    dl,
    pl,
    cl,
    ol: includeOrders && Array.isArray(payload.orders) ? payload.orders.slice(0, 8) : [],
  };
}

function expandCompactObject(obj: any): LinkStorePayload {
  const nowIso = new Date().toISOString();
  const spArr = Array.isArray(obj.sp) ? obj.sp : [];
  const shopProfile: ShopProfile = {
    shopName: spArr[0] || 'मेरी किराना दुकान',
    ownerName: spArr[1] || '',
    phone: spArr[2] || '',
    address: spArr[3] || '',
    gstNumber: spArr[4] || '',
    defaultOrderMessage: spArr[5] || '',
    ownerPin: spArr[6] || '1234',
  };

  const distributors: Distributor[] = (Array.isArray(obj.dl) ? obj.dl : []).map((entry: any) => {
    if (typeof entry === 'string') {
      const init = initialDistMap.get(entry);
      if (init) return { ...init };
    }
    if (Array.isArray(entry)) {
      return {
        id: entry[0] || `dist-${Date.now()}`,
        name: entry[1] || '',
        companyName: entry[2] || '',
        whatsappNumber: entry[3] || '',
        salesmanName: entry[4] || '',
        salesmanPhone: entry[5] || '',
        alternatePhone: entry[6] || '',
        category: entry[7] || 'जनरल किराना',
        deliveryDays: Array.isArray(entry[8]) ? entry[8] : [],
        upiId: entry[9] || '',
        address: entry[10] || '',
        notes: entry[11] || '',
        createdAt: nowIso,
      };
    }
    return entry as Distributor;
  });

  const products: Product[] = (Array.isArray(obj.pl) ? obj.pl : []).map((entry: any) => {
    if (typeof entry === 'string') {
      const init = initialProdMap.get(entry);
      if (init) return { ...init };
    }
    if (Array.isArray(entry)) {
      return {
        id: entry[0] || `prod-${Date.now()}`,
        name: entry[1] || '',
        hindiName: entry[2] || '',
        distributorId: entry[3] || distributors[0]?.id || 'dist-1',
        category: entry[4] || 'जनरल किराना',
        currentStock: Number(entry[5]) || 0,
        minStockAlert: Number(entry[6]) || 2,
        unit: entry[7] || 'पेटी (Carton/Box)',
        wholesalePrice: Number(entry[8]) || 0,
        mrp: Number(entry[9]) || 0,
        updatedAt: nowIso,
      };
    }
    return entry as Product;
  });

  const cart: CartItem[] = (Array.isArray(obj.cl) ? obj.cl : []).map((entry: any) => {
    if (Array.isArray(entry)) {
      return {
        productId: entry[0],
        productName: entry[1],
        distributorId: entry[2],
        quantity: Number(entry[3]) || 1,
        unit: entry[4] || 'पेटी (Carton/Box)',
        wholesalePrice: Number(entry[5]) || 0,
        mrp: Number(entry[6]) || 0,
        customNote: entry[7] || undefined,
        isCustomItem: Boolean(entry[8]),
      };
    }
    return entry as CartItem;
  });

  return {
    shopId: obj.s || 'KRN1000',
    updatedAt: Number(obj.u) || Date.now(),
    shopProfile,
    distributors,
    products,
    cart,
    orders: Array.isArray(obj.ol) ? obj.ol : [],
  };
}

async function compressString(jsonStr: string): Promise<string> {
  const utf8Bytes = new TextEncoder().encode(jsonStr);
  if (typeof CompressionStream !== 'undefined') {
    try {
      const cs = new CompressionStream('gzip');
      const writer = cs.writable.getWriter();
      await writer.write(utf8Bytes);
      await writer.close();
      const compressedBuffer = await new Response(cs.readable).arrayBuffer();
      return `gz.${uint8ToBase64Url(new Uint8Array(compressedBuffer))}`;
    } catch (err) {
      console.warn('Gzip compression failed, falling back to raw:', err);
    }
  }
  return `raw.${uint8ToBase64Url(utf8Bytes)}`;
}

export async function encodeStoreToLinkParam(payload: LinkStorePayload): Promise<string> {
  // First try compact v2 with recent orders
  const compactWithOrders = buildCompactObject(payload, true);
  let encoded = await compressString(JSON.stringify(compactWithOrders));

  // If over 3200 chars (query limit safety), drop orders from URL param (orders remain in server sync)
  if (encoded.length > 3200) {
    const compactNoOrders = buildCompactObject(payload, false);
    encoded = await compressString(JSON.stringify(compactNoOrders));
  }

  return encoded;
}

export async function decodeStoreFromString(encoded: string): Promise<LinkStorePayload | null> {
  try {
    if (!encoded) return null;
    let jsonStr = '';

    if (encoded.startsWith('gz.')) {
      const bytes = base64UrlToUint8(encoded.slice(3));
      if (typeof DecompressionStream === 'undefined') {
        throw new Error('DecompressionStream not supported in this browser');
      }
      const ds = new DecompressionStream('gzip');
      const writer = ds.writable.getWriter();
      await writer.write(bytes);
      await writer.close();
      const decompressedBuffer = await new Response(ds.readable).arrayBuffer();
      jsonStr = new TextDecoder().decode(decompressedBuffer);
    } else if (encoded.startsWith('raw.')) {
      const bytes = base64UrlToUint8(encoded.slice(4));
      jsonStr = new TextDecoder().decode(bytes);
    } else {
      const bytes = base64UrlToUint8(encoded);
      jsonStr = new TextDecoder().decode(bytes);
    }

    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') return null;

    if (parsed.v === 2) {
      return expandCompactObject(parsed);
    }

    if (Array.isArray(parsed.products) || Array.isArray(parsed.distributors)) {
      return parsed as LinkStorePayload;
    }
    return null;
  } catch (err) {
    console.error('Failed to decode store from link param:', err);
    return null;
  }
}

export async function decodeStoreFromUrl(search: string, hash: string): Promise<LinkStorePayload | null> {
  // Check query parameter ?d=... first (survives auth redirects!)
  if (search) {
    const qParams = new URLSearchParams(search);
    const qEncoded = qParams.get('d');
    if (qEncoded) {
      const decoded = await decodeStoreFromString(qEncoded);
      if (decoded) return decoded;
    }
  }
  // Also check hash #d=... as fallback
  if (hash && hash.includes('d=')) {
    const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
    const hParams = new URLSearchParams(cleanHash);
    const hEncoded = hParams.get('d');
    if (hEncoded) {
      return decodeStoreFromString(hEncoded);
    }
  }
  return null;
}
