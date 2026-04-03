export type ProductCategory =
  | "chocolates"
  | "gomitas"
  | "paletas"
  | "enchilados"
  | "regalos"
  | (string & Record<never, never>); // permite categorías dinámicas de BD

export type Category = {
  id: string;
  name: string;
  emoji: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  visible: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CheckoutForm = {
  customerName: string;
  phone: string;
  address: string;
  paymentType: "efectivo" | "transferencia";
  delivery: boolean;
  orderDate: string;
  orderTime: string;
};

export type Banner = {
  id: string;
  text: string;
  active: boolean;
  color: string;
  created_at?: string;
};
