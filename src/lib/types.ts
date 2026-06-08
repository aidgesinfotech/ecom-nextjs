export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_price: number;
  images: string[];
  category: string;
  sizes: string[];
  quantity: number;
  stock_status: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: number;
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
  created_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
}
