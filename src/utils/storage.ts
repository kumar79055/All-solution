import { Distributor, Product, CartItem, OrderRecord, ShopProfile } from '../types';
import { INITIAL_DISTRIBUTORS, INITIAL_PRODUCTS, DEFAULT_SHOP_PROFILE } from '../data/initialData';

const KEYS = {
  DISTRIBUTORS: 'kirana_distributors_v1',
  PRODUCTS: 'kirana_products_v1',
  CART: 'kirana_cart_v1',
  ORDERS: 'kirana_order_history_v1',
  SHOP: 'kirana_shop_profile_v1'
};

export const Storage = {
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
