import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Persistent file store for syncing customized shop data across Desktop & Mobile
const DATA_DIR = path.resolve(__dirname, 'data');
const SYNC_FILE = path.join(DATA_DIR, 'kirana-sync.json');

interface SyncStoreData {
  shopId: string;
  distributors: any[];
  products: any[];
  cart: any[];
  orders: any[];
  shopProfile: any;
  updatedAt: number;
}

interface SyncDatabase {
  lastShopId: string | null;
  stores: Record<string, SyncStoreData>;
}

function loadSyncDatabase(): SyncDatabase {
  try {
    if (fs.existsSync(SYNC_FILE)) {
      const raw = fs.readFileSync(SYNC_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.stores) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading sync database:', err);
  }
  return { lastShopId: null, stores: {} };
}

function saveSyncDatabase(db: SyncDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SYNC_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving sync database:', err);
  }
}

let syncDb: SyncDatabase = loadSyncDatabase();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Increase payload size for bill images (camera photos, receipts)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Sync Endpoint: Save customized store data for mobile/multi-device access
  app.post('/api/sync', (req, res) => {
    try {
      const { shopId, distributors, products, cart, orders, shopProfile, updatedAt } = req.body;
      if (!shopId || typeof shopId !== 'string') {
        return res.status(400).json({ success: false, error: 'shopId is required' });
      }
      const cleanShopId = shopId.trim().toUpperCase();
      const ts = typeof updatedAt === 'number' ? updatedAt : Date.now();

      syncDb.stores[cleanShopId] = {
        shopId: cleanShopId,
        distributors: Array.isArray(distributors) ? distributors : [],
        products: Array.isArray(products) ? products : [],
        cart: Array.isArray(cart) ? cart : [],
        orders: Array.isArray(orders) ? orders : [],
        shopProfile: shopProfile || {},
        updatedAt: ts,
      };
      syncDb.lastShopId = cleanShopId;
      saveSyncDatabase(syncDb);

      return res.json({
        success: true,
        shopId: cleanShopId,
        updatedAt: ts,
      });
    } catch (err: any) {
      console.error('Error in POST /api/sync:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Sync Endpoint: Retrieve customized store data by shopId (or 'latest')
  app.get('/api/sync/:shopId', (req, res) => {
    try {
      const requestedId = String(req.params.shopId || '').trim();
      let record: SyncStoreData | undefined;

      if (requestedId.toLowerCase() === 'latest') {
        if (syncDb.lastShopId && syncDb.stores[syncDb.lastShopId]) {
          record = syncDb.stores[syncDb.lastShopId];
        }
      } else {
        record = syncDb.stores[requestedId.toUpperCase()];
      }

      if (!record) {
        return res.status(404).json({ success: false, error: 'Store data not found' });
      }

      return res.json({
        success: true,
        data: record,
      });
    } catch (err: any) {
      console.error('Error in GET /api/sync/:shopId:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Initialize Gemini AI Client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API Endpoint: Scan & Extract Invoice / Bill
  app.post('/api/scan-bill', async (req, res) => {
    try {
      const { imageBase64, mimeType, billText, existingProducts } = req.body;

      if (!imageBase64 && !billText) {
        return res.status(400).json({ error: 'कृपया बिल की फोटो या बिल का टेक्स्ट भेजें।' });
      }

      if (!apiKey) {
        return res.status(500).json({ 
          error: 'Gemini API कुंजी (GEMINI_API_KEY) सेट नहीं है। कृपया AI Studio Settings > Secrets में API Key जांचें।' 
        });
      }

      const productsContext = Array.isArray(existingProducts) && existingProducts.length > 0
        ? `\nमौजूदा दुकान के सामान की सूची (Existing Store Items for matching):\n${JSON.stringify(
            existingProducts.map((p: any) => ({
              id: p.id,
              name: p.name,
              hindiName: p.hindiName || '',
              currentWholesalePrice: p.wholesalePrice || 0,
              unit: p.unit
            }))
          )}`
        : '';

      const prompt = `आप एक भारतीय किराना (Grocery Store) थोक बिल / चालान (Wholesale Invoice / Parcha / Bill) विश्लेषक हैं।
दिए गए बिल से सभी विवरण निकालें:
1. सप्लायर/डिस्ट्रीब्यूटर का नाम (Distributor/Supplier Name)
2. बिल नंबर व तारीख (Invoice No and Date)
3. सभी सामानों की लाइन-वाइज सूची:
   - सामान का नाम (Product Name)
   - मात्रा (Quantity)
   - इकाई (Unit: पेटी, बोरी, कट्टा, पैकेट, डिब्बा, दर्जन, लीटर, किलो, पीस)
   - नई खरीद दर (New Wholesale Purchase Rate per unit in INR). यदि कुल राशि और मात्रा दी है तो प्रति इकाई दर निकालें।
   - बिक्री दर (MRP, यदि बिल पर दी हो अन्यथा 0)
   - कुल राशि (Line Total)
   - 'matchedProductId': यदि यह सामान मौजूदा सामान सूची (Existing Store Items) से मिलता-जुलता है, तो उसका सटीक 'id' दें। यदि नया सामान है तो null दें।

${productsContext}`;

      let contents: any;

      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        contents = {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        };
      } else {
        contents = `${prompt}\n\nबिल का टेक्स्ट:\n${billText}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: 'You are an expert Indian Kirana store wholesale invoice reader. Extract all products, their purchase wholesale rates, quantities, and match them with store inventory. Return clean structured JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              distributorName: {
                type: Type.STRING,
                description: 'Name of the supplier or wholesale firm from the invoice header',
              },
              invoiceNumber: {
                type: Type.STRING,
                description: 'Invoice number or bill number if available, else empty string',
              },
              invoiceDate: {
                type: Type.STRING,
                description: 'Date of invoice in DD/MM/YYYY format if found',
              },
              totalBillAmount: {
                type: Type.NUMBER,
                description: 'Total invoice grand amount in INR',
              },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    rawItemName: {
                      type: Type.STRING,
                      description: 'Exact item description from the invoice',
                    },
                    suggestedProductName: {
                      type: Type.STRING,
                      description: 'Clean formatted Kirana product name (e.g. Parle-G ₹5, Fortune Oil 1L)',
                    },
                    matchedProductId: {
                      type: Type.STRING,
                      description: 'The id of the matched existing product from store list, or null/empty if new',
                    },
                    quantity: {
                      type: Type.NUMBER,
                      description: 'Quantity purchased',
                    },
                    unit: {
                      type: Type.STRING,
                      description: 'Unit of measure (पेटी, बोरी, पैकेट, डिब्बा, दर्जन, लीटर, किलो, पीस)',
                    },
                    newWholesalePrice: {
                      type: Type.NUMBER,
                      description: 'New purchase rate per single unit in Rupees (₹)',
                    },
                    mrp: {
                      type: Type.NUMBER,
                      description: 'Retail MRP if mentioned, else 0',
                    },
                    lineTotal: {
                      type: Type.NUMBER,
                      description: 'Total price for this line item in Rupees (₹)',
                    },
                  },
                  required: ['rawItemName', 'quantity', 'newWholesalePrice'],
                },
              },
            },
            required: ['items'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);

      return res.json({
        success: true,
        data: parsedData,
      });
    } catch (err: any) {
      console.error('Error scanning bill with Gemini:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'बिल स्कैन करने में त्रुटि हुई। कृपया दोबारा प्रयास करें।',
      });
    }
  });

  // Mount Vite or Static Frontend
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
