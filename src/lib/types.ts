export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  image_url: string;
  gallery: string[];
  colors: ProductColor[];
  sizes: string[];
  category: string;
  rating: number;
  reviews: number;
  badge: string | null;
  featured: boolean;
  in_stock: boolean;
  stock_count: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  size: string;
  color: ProductColor;
  quantity: number;
}

export interface OrderRow {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  items: Array<{
    product_id: string;
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  discount_code: string | null;
  discount_amount: number;
  status: string;
  tracking_id: string | null;
  courier: string | null;
  created_at: string;
}

export interface OrderPayload {
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  items: CartItem[];
  total: number;
  discount_code?: string;
  discount_amount?: number;
}

export interface ShopSettings {
  id: number;
  shop_name: string;
  shop_email: string;
  shop_phone: string;
  shop_address: string;
  about_title: string;
  about_description: string;
  about_image: string | null;
  free_shipping_threshold: number;
  tax_rate: number;
  updated_at: string;
}

export interface Discount {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface LookbookItem {
  id: string;
  image_url: string;
  alt_text: string;
  span: string;
  created_at: string;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  google_maps_url: string;
  google_maps_embed?: string;
  opening_hours: string;
  images: string[];
  is_flagship: boolean;
  active: boolean;
  created_at: string;
}

