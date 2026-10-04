import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Product, ShopSettings, Discount, LookbookItem, OrderRow, Branch } from './types';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(
  rawUrl &&
  rawKey &&
  typeof rawUrl === 'string' &&
  rawUrl.startsWith('http') &&
  !rawUrl.includes('placeholder')
);

// Initial seed data matching KINGWEAR catalog
const SEED_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Aero Pulse Pro',
    brand: 'KINGWEAR',
    description: 'Engineered for speed. The Aero Pulse Pro features a responsive carbon plate and ultra-light knit upper for explosive energy return on every stride.',
    price: 189.00,
    image_url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gallery: [
      'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    colors: [
      { name: 'Electric Blue', hex: '#2563eb' },
      { name: 'Crimson', hex: '#dc2626' },
      { name: 'Carbon', hex: '#1f2937' }
    ],
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    category: 'Running',
    rating: 4.8,
    reviews: 327,
    badge: 'Bestseller',
    featured: true,
    in_stock: true,
    stock_count: 50,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    id: 'p-2',
    name: 'Cloud Drifter',
    brand: 'KINGWEAR',
    description: 'All-day comfort meets street style. The Cloud Drifter uses a plush foam midsole and breathable mesh upper for a weightless feel from morning to night.',
    price: 145.00,
    image_url: 'https://images.pexels.com/photos/12628400/pexels-photo-12628400.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gallery: [
      'https://images.pexels.com/photos/12628400/pexels-photo-12628400.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ],
    colors: [
      { name: 'Cloud White', hex: '#f3f4f6' },
      { name: 'Sage', hex: '#84cc16' },
      { name: 'Slate', hex: '#475569' }
    ],
    sizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '11'],
    category: 'Lifestyle',
    rating: 4.6,
    reviews: 214,
    badge: 'New',
    featured: true,
    in_stock: true,
    stock_count: 42,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: 'p-3',
    name: 'Velocity Knight',
    brand: 'KINGWEAR',
    description: 'Dominate the court. The Velocity Knight wraps a high-top silhouette around a full-length air unit for maximum impact protection and ankle support.',
    price: 220.00,
    image_url: 'https://images.pexels.com/photos/5413290/pexels-photo-5413290.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gallery: [
      'https://images.pexels.com/photos/5413290/pexels-photo-5413290.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ],
    colors: [
      { name: 'Forest', hex: '#16a34a' },
      { name: 'Carbon', hex: '#1f2937' },
      { name: 'Solar', hex: '#f59e0b' }
    ],
    sizes: ['7', '8', '9', '10', '11', '12', '13'],
    category: 'Basketball',
    rating: 4.9,
    reviews: 512,
    badge: 'Bestseller',
    featured: true,
    in_stock: true,
    stock_count: 30,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    id: 'p-4',
    name: 'Midnight Runner',
    brand: 'KINGWEAR',
    description: 'Sleek low-profile design with a premium leather upper. The Midnight Runner transitions seamlessly from the track to a night out.',
    price: 175.00,
    image_url: 'https://images.pexels.com/photos/20755674/pexels-photo-20755674.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gallery: [
      'https://images.pexels.com/photos/20755674/pexels-photo-20755674.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ],
    colors: [
      { name: 'Midnight', hex: '#1e3a8a' },
      { name: 'Bone', hex: '#f5f5dc' },
      { name: 'Carbon', hex: '#1f2937' }
    ],
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    category: 'Lifestyle',
    rating: 4.7,
    reviews: 189,
    badge: null,
    featured: false,
    in_stock: true,
    stock_count: 60,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'p-5',
    name: 'Phantom Surge',
    brand: 'KINGWEAR',
    description: 'Stealth meets performance. The Phantom Surge features a blacked-out knit upper with reflective accents and a spring-loaded midsole.',
    price: 205.00,
    image_url: 'https://images.pexels.com/photos/11559288/pexels-photo-11559288.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gallery: [
      'https://images.pexels.com/photos/11559288/pexels-photo-11559288.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ],
    colors: [
      { name: 'Phantom', hex: '#111827' },
      { name: 'Volt', hex: '#84cc16' },
      { name: 'Crimson', hex: '#dc2626' }
    ],
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    category: 'Running',
    rating: 4.8,
    reviews: 401,
    badge: 'New',
    featured: false,
    in_stock: true,
    stock_count: 25,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'p-6',
    name: 'Retro Glide',
    brand: 'KINGWEAR',
    description: 'Throwback style with modern comfort. The Retro Glide blends vintage lines with a cushioned ortholite insole for everyday wear.',
    price: 135.00,
    image_url: 'https://images.pexels.com/photos/30313904/pexels-photo-30313904.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gallery: [
      'https://images.pexels.com/photos/30313904/pexels-photo-30313904.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ],
    colors: [
      { name: 'Sand', hex: '#d4a574' },
      { name: 'Rust', hex: '#c2410c' },
      { name: 'Bone', hex: '#f5f5dc' }
    ],
    sizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '11'],
    category: 'Lifestyle',
    rating: 4.5,
    reviews: 156,
    badge: null,
    featured: false,
    in_stock: true,
    stock_count: 48,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'p-7',
    name: 'Apex Flare',
    brand: 'KINGWEAR',
    description: 'Bold color blocking for the bold at heart. The Apex Flare turns heads with its vibrant panels and lightweight cushioned ride.',
    price: 165.00,
    image_url: 'https://images.pexels.com/photos/14525666/pexels-photo-14525666.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gallery: [
      'https://images.pexels.com/photos/14525666/pexels-photo-14525666.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ],
    colors: [
      { name: 'Cobalt', hex: '#2563eb' },
      { name: 'Coral', hex: '#fb7185' },
      { name: 'Carbon', hex: '#1f2937' }
    ],
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
    category: 'Running',
    rating: 4.7,
    reviews: 233,
    badge: null,
    featured: false,
    in_stock: true,
    stock_count: 36,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'p-8',
    name: 'Trail Blazer X',
    brand: 'KINGWEAR',
    description: 'Conquer any terrain. The Trail Blazer X features an aggressive lug pattern, waterproof membrane, and rock-shield plate for the outdoors.',
    price: 195.00,
    image_url: 'https://images.pexels.com/photos/16918373/pexels-photo-16918373.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gallery: [
      'https://images.pexels.com/photos/16918373/pexels-photo-16918373.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ],
    colors: [
      { name: 'Arctic', hex: '#3b82f6' },
      { name: 'Forest', hex: '#16a34a' },
      { name: 'Carbon', hex: '#1f2937' }
    ],
    sizes: ['7', '8', '9', '10', '11', '12', '13'],
    category: 'Trail',
    rating: 4.8,
    reviews: 178,
    badge: 'Bestseller',
    featured: false,
    in_stock: true,
    stock_count: 55,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

const SEED_SETTINGS: ShopSettings = {
  id: 1,
  shop_name: 'KINGWEAR',
  shop_email: 'hello@kingwear.com',
  shop_phone: '+1 (555) 010-2030',
  shop_address: '100 KingWear Plaza, Fashion District, New York, NY 10001',
  about_title: 'Crafted For Royal Movement',
  about_description: "We obsess over every detail so you don't have to. From high-tier performance engineering to streetwear elegance, KINGWEAR is built for excellence.",
  about_image: null,
  free_shipping_threshold: 99,
  tax_rate: 0.08,
  updated_at: new Date().toISOString(),
};

const SEED_DISCOUNTS: Discount[] = [
  {
    id: 'd-1',
    code: 'KINGWEAR20',
    description: '20% off entire order',
    type: 'percentage',
    value: 20,
    active: true,
    expires_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'd-2',
    code: 'WELCOME10',
    description: '$10 off first purchase',
    type: 'fixed',
    value: 10,
    active: true,
    expires_at: null,
    created_at: new Date().toISOString(),
  },
];

const SEED_BRANCHES: Branch[] = [
  {
    id: 'br-1',
    name: 'KINGWEAR Flagship SoHo',
    city: 'New York, NY',
    address: '540 Broadway, SoHo, New York, NY 10012',
    phone: '+1 (212) 555-0199',
    email: 'soho@kingwear.com',
    google_maps_url: 'https://maps.google.com/?q=540+Broadway+New+York+NY+10012',
    google_maps_embed: 'https://maps.google.com/maps?q=540+Broadway+New+York+NY+10012&t=&z=14&ie=UTF8&iwloc=&output=embed',
    opening_hours: 'Mon - Sat: 10:00 AM - 9:00 PM | Sun: 11:00 AM - 7:00 PM',
    images: [
      'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1082528/pexels-photo-1082528.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2048548/pexels-photo-2048548.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    is_flagship: true,
    active: true,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'br-2',
    name: 'KINGWEAR Downtown LA',
    city: 'Los Angeles, CA',
    address: '850 S Broadway, Los Angeles, CA 90014',
    phone: '+1 (213) 555-0142',
    email: 'la@kingwear.com',
    google_maps_url: 'https://maps.google.com/?q=850+S+Broadway+Los+Angeles+CA+90014',
    google_maps_embed: 'https://maps.google.com/maps?q=850+S+Broadway+Los+Angeles+CA+90014&t=&z=14&ie=UTF8&iwloc=&output=embed',
    opening_hours: 'Mon - Sun: 10:00 AM - 8:00 PM',
    images: [
      'https://images.pexels.com/photos/135620/pexels-photo-135620.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    is_flagship: false,
    active: true,
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 'br-3',
    name: 'KINGWEAR Magnificent Mile',
    city: 'Chicago, IL',
    address: '605 N Michigan Ave, Chicago, IL 60611',
    phone: '+1 (312) 555-0188',
    email: 'chicago@kingwear.com',
    google_maps_url: 'https://maps.google.com/?q=605+N+Michigan+Ave+Chicago+IL+60611',
    google_maps_embed: 'https://maps.google.com/maps?q=605+N+Michigan+Ave+Chicago+IL+60611&t=&z=14&ie=UTF8&iwloc=&output=embed',
    opening_hours: 'Mon - Sat: 10:00 AM - 8:00 PM | Sun: 11:00 AM - 6:00 PM',
    images: [
      'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    is_flagship: false,
    active: true,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'br-4',
    name: 'KINGWEAR Miami Design District',
    city: 'Miami, FL',
    address: '140 NE 39th St, Miami, FL 33137',
    phone: '+1 (305) 555-0177',
    email: 'miami@kingwear.com',
    google_maps_url: 'https://maps.google.com/?q=140+NE+39th+St+Miami+FL+33137',
    google_maps_embed: 'https://maps.google.com/maps?q=140+NE+39th+St+Miami+FL+33137&t=&z=14&ie=UTF8&iwloc=&output=embed',
    opening_hours: 'Mon - Sat: 11:00 AM - 9:00 PM | Sun: 12:00 PM - 6:00 PM',
    images: [
      'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3316924/pexels-photo-3316924.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    is_flagship: false,
    active: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  }
];

const SEED_LOOKBOOK: LookbookItem[] = [
  { id: 'lb-1', image_url: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=800', alt_text: 'Street style sneakers', span: 'row-span-2', created_at: new Date().toISOString() },
  { id: 'lb-2', image_url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800', alt_text: 'Running shoes on track', span: '', created_at: new Date().toISOString() },
  { id: 'lb-3', image_url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800', alt_text: 'Lifestyle sneakers', span: '', created_at: new Date().toISOString() },
  { id: 'lb-4', image_url: 'https://images.pexels.com/photos/3316924/pexels-photo-3316924.jpeg?auto=compress&cs=tinysrgb&w=800', alt_text: 'Athletic shoes in motion', span: 'row-span-2', created_at: new Date().toISOString() },
  { id: 'lb-5', image_url: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=800', alt_text: 'Casual shoe style', span: '', created_at: new Date().toISOString() },
  { id: 'lb-6', image_url: 'https://images.pexels.com/photos/2562992/pexels-photo-2562992.png?auto=compress&cs=tinysrgb&w=800', alt_text: 'Outdoor shoes', span: '', created_at: new Date().toISOString() },
  { id: 'lb-7', image_url: 'https://images.pexels.com/photos/1082528/pexels-photo-1082528.jpeg?auto=compress&cs=tinysrgb&w=800', alt_text: 'Fashion sneakers on feet', span: 'row-span-2', created_at: new Date().toISOString() },
  { id: 'lb-8', image_url: 'https://images.pexels.com/photos/1546003/pexels-photo-1546003.jpeg?auto=compress&cs=tinysrgb&w=800', alt_text: 'White sneakers closeup', span: '', created_at: new Date().toISOString() },
  { id: 'lb-9', image_url: 'https://images.pexels.com/photos/2048548/pexels-photo-2048548.jpeg?auto=compress&cs=tinysrgb&w=800', alt_text: 'Colorful shoes collection', span: '', created_at: new Date().toISOString() }
];

const SEED_ORDERS: OrderRow[] = [
  {
    id: 'ord-94281',
    customer_name: 'Alex Johnson',
    customer_email: 'alex@kingwear.com',
    shipping_address: '742 Evergreen Terrace, Springfield, OR',
    items: [
      { product_id: 'p-1', name: 'Aero Pulse Pro', size: '10', color: 'Electric Blue', quantity: 1, price: 189 }
    ],
    total: 189,
    discount_code: null,
    discount_amount: 0,
    status: 'shipped',
    tracking_id: 'KW-9842104',
    courier: 'FedEx',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'ord-51829',
    customer_name: 'Sarah Connor',
    customer_email: 'sarah@kingwear.com',
    shipping_address: '100 Ocean Drive, Miami, FL',
    items: [
      { product_id: 'p-2', name: 'Cloud Drifter', size: '8', color: 'Cloud White', quantity: 1, price: 145 }
    ],
    total: 116,
    discount_code: 'KINGWEAR20',
    discount_amount: 29,
    status: 'processing',
    tracking_id: null,
    courier: null,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'ord-38914',
    customer_name: 'David Miller',
    customer_email: 'david@example.com',
    shipping_address: '320 West End Ave, New York, NY 10023',
    items: [
      { product_id: 'p-3', name: 'Velocity Knight', size: '11', color: 'Carbon', quantity: 1, price: 220 }
    ],
    total: 220,
    discount_code: null,
    discount_amount: 0,
    status: 'pending',
    tracking_id: null,
    courier: null,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'ord-21049',
    customer_name: 'Jessica Taylor',
    customer_email: 'jessica@example.com',
    shipping_address: '45 Lake Shore Drive, Chicago, IL 60601',
    items: [
      { product_id: 'p-5', name: 'Phantom Surge', size: '9', color: 'Phantom', quantity: 1, price: 205 }
    ],
    total: 205,
    discount_code: null,
    discount_amount: 0,
    status: 'delivered',
    tracking_id: 'KW-7731294',
    courier: 'UPS',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  }
];

const SEED_REVIEWS = [
  {
    id: 'rev-1',
    product_id: 'p-1',
    reviewer_name: 'Marcus K.',
    rating: 5,
    comment: 'Best running shoes I have owned! The carbon plate propulsion is unreal.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'rev-2',
    product_id: 'p-2',
    reviewer_name: 'Elena R.',
    rating: 5,
    comment: 'Unbelievably comfortable for daily walks and travel.',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  }
];

// Helper to interact with browser localStorage
function getStorageTable<T>(table: string, defaultData: T[]): T[] {
  try {
    const raw = localStorage.getItem(`kingwear_store_${table}`) || localStorage.getItem(`stride_store_${table}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (table === 'branches' && Array.isArray(parsed)) {
        return parsed.map((item: any, idx: number) => {
          const fallback = (defaultData as any[])[idx] || {};
          return {
            ...fallback,
            ...item,
            images: Array.isArray(item.images) && item.images.length > 0 ? item.images : (fallback.images || []),
          };
        });
      }
      return parsed;
    }
    localStorage.setItem(`kingwear_store_${table}`, JSON.stringify(defaultData));
    return defaultData;
  } catch {
    return defaultData;
  }
}

function setStorageTable<T>(table: string, data: T[]) {
  try {
    localStorage.setItem(`kingwear_store_${table}`, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// Create an in-memory & localStorage mock Supabase client
function createMockSupabaseClient() {
  const authListeners: Array<(event: string, session: any) => void> = [];

  const getSessionFromStorage = () => {
    try {
      const raw = localStorage.getItem('kingwear_auth_session') || localStorage.getItem('stride_auth_session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  return {
    from: (table: string) => {
      let items: any[] = [];
      if (table === 'products') items = getStorageTable('products', SEED_PRODUCTS);
      else if (table === 'settings') items = [getStorageTable('settings', [SEED_SETTINGS])[0] ?? SEED_SETTINGS];
      else if (table === 'discounts') items = getStorageTable('discounts', SEED_DISCOUNTS);
      else if (table === 'orders') items = getStorageTable('orders', SEED_ORDERS);
      else if (table === 'branches') items = getStorageTable('branches', SEED_BRANCHES);
      else if (table === 'lookbook_items') items = getStorageTable('lookbook_items', SEED_LOOKBOOK);
      else if (table === 'reviews') items = getStorageTable('reviews', SEED_REVIEWS);
      else if (table === 'stock_notifications') items = getStorageTable('stock_notifications', []);
      else items = getStorageTable(table, []);

      let filtered = [...items];
      let pendingInsertData: any = null;
      let pendingUpdateData: any = null;
      let isDelete = false;
      const filters: Array<(row: any) => boolean> = [];
      let sortFn: ((a: any, b: any) => number) | null = null;
      let limitCount: number | null = null;

      const saveTable = () => {
        if (table === 'settings') {
          setStorageTable('settings', items);
        } else {
          setStorageTable(table, items);
        }
      };

      const execute = async () => {
        if (pendingInsertData) {
          const toInsert = Array.isArray(pendingInsertData) ? pendingInsertData : [pendingInsertData];
          const createdList = toInsert.map((item) => ({
            id: item.id || `gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            created_at: item.created_at || new Date().toISOString(),
            ...item,
          }));
          items.push(...createdList);
          saveTable();
          return { data: Array.isArray(pendingInsertData) ? createdList : createdList[0], error: null };
        }

        if (pendingUpdateData) {
          let updatedCount = 0;
          items = items.map((row) => {
            const matches = filters.every((fn) => fn(row));
            if (matches) {
              updatedCount++;
              return { ...row, ...pendingUpdateData, updated_at: new Date().toISOString() };
            }
            return row;
          });
          saveTable();
          return { data: updatedCount, error: null };
        }

        if (isDelete) {
          items = items.filter((row) => !filters.every((fn) => fn(row)));
          saveTable();
          return { data: null, error: null };
        }

        // Query execution
        let result = items.filter((row) => filters.every((fn) => fn(row)));
        if (sortFn) {
          result.sort(sortFn);
        }
        if (limitCount !== null) {
          result = result.slice(0, limitCount);
        }
        return { data: result, error: null };
      };

      const chain: any = {
        select: (_fields?: string) => chain,
        insert: (data: any) => {
          pendingInsertData = data;
          return chain;
        },
        update: (data: any) => {
          pendingUpdateData = data;
          return chain;
        },
        delete: () => {
          isDelete = true;
          return chain;
        },
        eq: (col: string, val: any) => {
          filters.push((row) => String(row[col]) === String(val));
          return chain;
        },
        neq: (col: string, val: any) => {
          filters.push((row) => String(row[col]) !== String(val));
          return chain;
        },
        ilike: (col: string, val: string) => {
          filters.push((row) => {
            const s = String(row[col] ?? '').toLowerCase();
            const pattern = val.replace(/%/g, '').toLowerCase();
            return s.includes(pattern);
          });
          return chain;
        },
        order: (col: string, options?: { ascending?: boolean }) => {
          const asc = options?.ascending !== false;
          sortFn = (a: any, b: any) => {
            const valA = a[col];
            const valB = b[col];
            if (valA === valB) return 0;
            if (valA === null || valA === undefined) return asc ? -1 : 1;
            if (valB === null || valB === undefined) return asc ? 1 : -1;
            if (typeof valA === 'number' && typeof valB === 'number') {
              return asc ? valA - valB : valB - valA;
            }
            return asc
              ? String(valA).localeCompare(String(valB))
              : String(valB).localeCompare(String(valA));
          };
          return chain;
        },
        limit: (n: number) => {
          limitCount = n;
          return chain;
        },
        single: async () => {
          const res = await execute();
          const first = Array.isArray(res.data) ? res.data[0] : res.data;
          return { data: first ?? null, error: null };
        },
        maybeSingle: async () => {
          const res = await execute();
          const first = Array.isArray(res.data) ? res.data[0] : res.data;
          return { data: first ?? null, error: null };
        },
        then: (onfulfilled?: (val: any) => any, onrejected?: (err: any) => any) => {
          return execute().then(onfulfilled, onrejected);
        },
      };

      return chain;
    },

    auth: {
      getSession: async () => {
        const session = getSessionFromStorage();
        return { data: { session }, error: null };
      },
      onAuthStateChange: (cb: (event: string, session: any) => void) => {
        authListeners.push(cb);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const idx = authListeners.indexOf(cb);
                if (idx !== -1) authListeners.splice(idx, 1);
              },
            },
          },
        };
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        if (!email || !password) {
          return { data: null, error: { message: 'Email and password required' } };
        }
        const user = {
          id: 'admin-user-1',
          email,
          role: 'authenticated',
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        const session = {
          access_token: 'mock-access-token',
          token_type: 'bearer',
          user,
        };
        try {
          localStorage.setItem('kingwear_auth_session', JSON.stringify(session));
        } catch {}
        authListeners.forEach((fn) => fn('SIGNED_IN', session));
        return { data: { session, user }, error: null };
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        if (!email || !password || password.length < 6) {
          return { data: null, error: { message: 'Password must be at least 6 characters' } };
        }
        const user = {
          id: 'admin-user-' + Date.now(),
          email,
          role: 'authenticated',
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        const session = {
          access_token: 'mock-access-token',
          token_type: 'bearer',
          user,
        };
        try {
          localStorage.setItem('kingwear_auth_session', JSON.stringify(session));
        } catch {}
        authListeners.forEach((fn) => fn('SIGNED_IN', session));
        return { data: { session, user }, error: null };
      },
      signOut: async () => {
        try {
          localStorage.removeItem('kingwear_auth_session');
          localStorage.removeItem('stride_auth_session');
        } catch {}
        authListeners.forEach((fn) => fn('SIGNED_OUT', null));
        return { error: null };
      },
    },
  };
}

// Fallback safely to mock client if Supabase is unconfigured or throws
let clientInstance: any;

if (isConfigured) {
  try {
    clientInstance = createClient(rawUrl as string, rawKey as string);
  } catch (err) {
    console.warn('[AI Studio] Supabase init failed, falling back to local store mock:', err);
    clientInstance = createMockSupabaseClient();
  }
} else {
  clientInstance = createMockSupabaseClient();
}

export const supabase = clientInstance as unknown as SupabaseClient;
