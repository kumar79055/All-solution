import { CartItem, Distributor, OrderRecord, Product, ShopProfile } from '../types';

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

export async function encodeStoreToLinkParam(payload: LinkStorePayload): Promise<string> {
  // Keep payload lean for URL sharing (cap order history in link to latest 20 orders)
  const compactPayload: LinkStorePayload = {
    shopId: payload.shopId,
    distributors: payload.distributors,
    products: payload.products,
    cart: payload.cart,
    orders: Array.isArray(payload.orders) ? payload.orders.slice(0, 20) : [],
    shopProfile: payload.shopProfile,
    updatedAt: payload.updatedAt || Date.now(),
  };

  const jsonStr = JSON.stringify(compactPayload);
  const utf8Bytes = new TextEncoder().encode(jsonStr);

  if (typeof CompressionStream !== 'undefined') {
    try {
      const cs = new CompressionStream('gzip');
      const writer = cs.writable.getWriter();
      await writer.write(utf8Bytes);
      await writer.close();

      const compressedBuffer = await new Response(cs.readable).arrayBuffer();
      const compressedBytes = new Uint8Array(compressedBuffer);
      return `gz.${uint8ToBase64Url(compressedBytes)}`;
    } catch (err) {
      console.warn('Gzip compression failed, falling back to raw encoding:', err);
    }
  }

  return `raw.${uint8ToBase64Url(utf8Bytes)}`;
}

export async function decodeStoreFromHash(hash: string): Promise<LinkStorePayload | null> {
  try {
    if (!hash || !hash.includes('d=')) return null;
    const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
    const params = new URLSearchParams(cleanHash);
    const encoded = params.get('d');
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
    if (parsed && typeof parsed === 'object' && (Array.isArray(parsed.products) || Array.isArray(parsed.distributors))) {
      return parsed as LinkStorePayload;
    }
    return null;
  } catch (err) {
    console.error('Failed to decode store from URL hash:', err);
    return null;
  }
}
