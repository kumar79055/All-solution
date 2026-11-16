import { Distributor, Product, CartItem, OrderRecord, ShopProfile } from '../types';
import { INITIAL_DISTRIBUTORS, INITIAL_PRODUCTS, DEFAULT_SHOP_PROFILE } from '../data/initialData';

const KEYS = {
  DISTRIBUTORS: 'kirana_distributors_v1',
  PRODUCTS: 'kirana_products_v1',
  CART: 'kirana_cart_v1',
  ORDERS: 'kirana_order_history_v1',
  SHOP: 'kirana_shop_profile_v1',
  SHOP_SYNC_ID: 'kirana_shop_sync_id_v1',
  SYNC_UPDATED_AT: 'kirana_sync_updated_at_v1'
};

export interface SyncPayload {
  shopId: string;
  distributors: Distributor[];
  products: Product[];
  cart: CartItem[];
  orders: OrderRecord[];
  shopProfile: ShopProfile;
  updatedAt: number;
}

export const Storage = {
  hasExistingLocalStore(): boolean {
    try {
      return Boolean(
        localStorage.getItem(KEYS.PRODUCTS) ||
        localStorage.getItem(KEYS.DISTRIBUTORS) ||
        localStorage.getItem(KEYS.SHOP_SYNC_ID)
      );
    } catch {
      return false;
    }
  },

  getShopSyncId(): string | null {
    try {
      return localStorage.getItem(KEYS.SHOP_SYNC_ID);
    } catch {
      return null;
    }
  },

  setShopSyncId(id: string): void {
    try {
      localStorage.setItem(KEYS.SHOP_SYNC_ID, id.trim().toUpperCase());
    } catch {}
  },

  getOrCreateShopSyncId(): string {
    const existing = this.getShopSyncId();
    if (existing) return existing;
    const generated = `KRN${Math.floor(1000 + Math.random() * 9000)}`;
    this.setShopSyncId(generated);
    return generated;
  },

  getSyncUpdatedAt(): number {
    try {
      const val = localStorage.getItem(KEYS.SYNC_UPDATED_AT);
      return val ? Number(val) || 0 : 0;
    } catch {
      return 0;
    }
  },

  setSyncUpdatedAt(ts: number): void {
    try {
      localStorage.setItem(KEYS.SYNC_UPDATED_AT, String(ts));
    } catch {}
  },

  async pushToServer(payload: SyncPayload): Promise<boolean> {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return false;
      const json = await res.json();
      if (json.success && json.updatedAt) {
        this.setSyncUpdatedAt(json.updatedAt);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Sync push error:', e);
      return false;
    }
  },

  async pullFromServer(shopId: string): Promise<SyncPayload | null> {
    try {
      const res = await fetch(`/api/sync/${encodeURIComponent(shopId)}`);
      if (!res.ok) return null;
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as SyncPayload;
      }
      return null;
    } catch (e) {
      console.error('Sync pull error:', e);
      return null;
    }
  },

  getDistributors(): Distributor[] {
    try {
      const data = localStorage.getItem(KEYS.DISTRIBUTORS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading distributors from storage:', e);
    }
    // initialize default
    localStorage.setItem(KEYS.DISTRIBUTORS, JSON.stringify(INITIAL_DISTRIBUTORS));
    return INITIAL_DISTRIBUTORS;
  },

  saveDistributors(distributors: Distributor[]): void {
    try {
      localStorage.setItem(KEYS.DISTRIBUTORS, JSON.stringify(distributors));
    } catch (e) {
      console.error('Error saving distributors:', e);
    }
  },

  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(KEYS.PRODUCTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading products from storage:', e);
    }
    // initialize default
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  },

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products:', e);
    }
  },

  getCart(): CartItem[] {
    try {
      const data = localStorage.getItem(KEYS.CART);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading cart:', e);
    }
    return [];
  },

  saveCart(cart: CartItem[]): void {
    try {
      localStorage.setItem(KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  },

  getOrderHistory(): OrderRecord[] {
    try {
      const data = localStorage.getItem(KEYS.ORDERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading order history:', e);
    }
    return [];
  },

  saveOrderHistory(orders: OrderRecord[]): void {
    try {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving order history:', e);
    }
  },

  getShopProfile(): ShopProfile {
    try {
      const data = localStorage.getItem(KEYS.SHOP);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading shop profile:', e);
    }
    localStorage.setItem(KEYS.SHOP, JSON.stringify(DEFAULT_SHOP_PROFILE));
    return DEFAULT_SHOP_PROFILE;
  },

  saveShopProfile(profile: ShopProfile): void {
    try {
      localStorage.setItem(KEYS.SHOP, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving shop profile:', e);
    }
  },

  resetToDefaultData(): void {
    localStorage.setItem(KEYS.DISTRIBUTORS, JSON.stringify(INITIAL_DISTRIBUTORS));
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(KEYS.SHOP, JSON.stringify(DEFAULT_SHOP_PROFILE));
    localStorage.removeItem(KEYS.CART);
  },

  exportAllData(): string {
    const backup = {
      distributors: this.getDistributors(),
      products: this.getProducts(),
      shopProfile: this.getShopProfile(),
      orders: this.getOrderHistory(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(backup, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.distributors && parsed.products) {
        if (parsed.distributors) this.saveDistributors(parsed.distributors);
        if (parsed.products) this.saveProducts(parsed.products);
        if (parsed.shopProfile) this.saveShopProfile(parsed.shopProfile);
        if (parsed.orders) this.saveOrderHistory(parsed.orders);
        return true;
      }
    } catch (e) {
      console.error('Failed to import backup data:', e);
    }
    return false;
  }
};
