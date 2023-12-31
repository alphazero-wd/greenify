export interface CreateOrderDto {
  id: string;
  customer: string;
  email: string;
  phone: string;
  total: number;
  shippingCost: number;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  cart: {
    productId: number;
    qty: number;
  }[];
}
