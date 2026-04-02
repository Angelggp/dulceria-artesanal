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
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CheckoutForm = {
  customerName: string;
  address: string;
  paymentType: "efectivo" | "transferencia";
  delivery: boolean;
  orderDate: string;
};
