export interface SizeOption {
  label: string;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_price: number;
  images: string[];
  category: string;
  sku: string | null;
  sizes: SizeOption[];
  quantity: number;
  stock_status: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: number;
  order_number: string | null;
  product_id: string;
  product_name: string;
  size: string;
  quantity: number;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: string;
  total: number;
  status: string;
  resolved_sku: string | null;
  shipeaso_response: string | null;
  created_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
}
