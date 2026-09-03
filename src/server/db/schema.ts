export interface SavedAddress {
  id: string;
  label: string; // e.g., 'Home', 'Work', 'Condo', 'Other'
  address: string;
  details?: string; // e.g., 'Floor 4, Unit 402, Landmark near 7-Eleven'
  lat?: number;
  lng?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  address?: string;
  number?: string;
  saved_addresses?: string | null;
}

export interface Admin {
  id: number;
  name: string;
  password?: string;
  session_id?: string | null;
}

export type ProductStatus = 'available' | 'sold_out' | 'unavailable' | 'inactive';

export interface OptionChoice {
  name: string;
  price: number;
}

export interface OptionGroup {
  id: string;
  title: string;
  type: 'single' | 'multiple'; // single = radio (e.g. size/flavor), multiple = checkboxes (e.g. add-ons/toppings)
  required?: boolean;
  choices: OptionChoice[];
}

export interface Product {
  id: number;
  name: string;
  category?: string;
  price: number;
  status: ProductStatus;
  has_customizations?: boolean | number;
  customization_options?: string | null;
  description?: string;
  image: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  pid: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options?: string | null;
  sizeID?: number;
  customIDS?: string;
  sizename?: string;
  sizeprice?: number;
}

export interface Favorite {
  id: number;
  user_id: number;
  product_id: number;
  name: string;
  price: number;
  image: string;
}

export interface Order {
  id: number;
  user_id: number;
  name: string;
  number: string;
  email?: string;
  method: string;
  address: string;
  delivery_notes?: string | null;
  payment_proof?: string | null;
  order_type?: 'delivery' | 'pickup';
  order_status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  cancellation_reason?: string | null;
  lat?: number | null;
  lng?: number | null;
  total_products?: string;
  total_price: number;
  placed_on: string;
  payment_status: 'pending' | 'completed';
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  customizations?: string;
}

export interface Sale {
  id: number;
  product_id: number;
  price: number;
  qty: number;
  sizeID?: string;
  cusIDs?: string;
  date: string;
  product_name?: string;
}

export interface AuthSession {
  id: number;
  name: string;
  email?: string;
  role: 'user' | 'admin';
  sessionId?: string;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  code?: string;
}
