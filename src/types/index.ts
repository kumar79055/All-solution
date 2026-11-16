export type UnitType = 
  | 'पेटी (Carton/Box)'
  | 'बोरी / कट्टा (Sack/Bag)'
  | 'पैकेट (Packet)'
  | 'डिब्बा (Tin/Jar)'
  | 'दर्जन (Dozen)'
  | 'लीटर (Litre)'
  | 'किलो (Kg)'
  | 'पीस / नग (Piece)'
  | 'अन्य (Other)';

export interface Distributor {
  id: string;
  name: string; // Distributor or Contact Person (e.g. मोहन लाल जी)
  companyName: string; // Firm / Agency Name (e.g. माँ वैष्णो एजेंसीज - पारले व आईटीसी)
  whatsappNumber: string; // Distributor WhatsApp No (e.g. 9876543210 or +919876543210)
  salesmanName?: string; // Salesman Name (e.g. राहुल - सेल्समैन)
  salesmanPhone?: string; // Salesman WhatsApp No (e.g. 9823456789)
  alternatePhone?: string;
  category: string; // Primary category (e.g. बिस्कुट व नमकीन, तेल व घी, दाल व मसाले)
  deliveryDays?: string[]; // e.g. ["सोमवार", "गुरुवार"]
  upiId?: string;
  address?: string;
  notes?: string; // e.g. सुबह 11 बजे से पहले ऑर्डर दें
  createdAt: string;
}

export interface Product {
  id: string;
  name: string; // Product Name (e.g. Parle-G ₹5, Fortune Oil 1L)
  hindiName?: string;
  distributorId: string; // Assigned distributor
  category: string;
  currentStock: number;
  minStockAlert: number;
  unit: UnitType | string;
  wholesalePrice: number; // Purchase price from distributor
  mrp: number; // Retail MRP
  barcode?: string;
  notes?: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  distributorId: string;
  quantity: number;
  unit: string;
  wholesalePrice: number;
  mrp?: number;
  customNote?: string;
  isCustomItem?: boolean;
}

export interface DistributorOrderGroup {
  distributor: Distributor;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  customDistributorNote: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  distributorId: string;
  distributorName: string;
  distributorPhone: string;
  recipientType?: 'distributor' | 'salesman' | 'both';
  recipientName?: string;
  recipientPhone?: string;
  companyName: string;
  items: {
    name: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
  }[];
  totalAmount: number;
  status: 'sent' | 'delivered' | 'cancelled' | 'pending';
  sentAt: string;
  deliveredAt?: string;
  customNote?: string;
}

export interface ShopProfile {
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
  gstNumber?: string;
  defaultOrderMessage: string;
  ownerPin?: string; // 4-digit PIN for Owner Mode
}

export type UserRole = 'malik' | 'worker'; // 'malik' (Owner - sees purchase rate) | 'worker' (Staff - sees only selling rate)

export interface ScannedBillItem {
  rawItemName: string;
  suggestedProductName: string;
  matchedProductId: string | null;
  quantity: number;
  unit: string;
  newWholesalePrice: number;
  mrp?: number;
  lineTotal?: number;
  selected?: boolean;
  updateStock?: boolean;
}

export interface ScannedBillResult {
  distributorName?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  totalBillAmount?: number;
  items: ScannedBillItem[];
}
