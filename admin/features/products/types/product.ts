import { Category } from "@/features/categories/types";

export interface Product {
  id: number;
  name: string;
  desc: string;
  price: number;
  status: "Active" | "Draft";
  inStock: number;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
  images: ProductImage[];
  _count: { orders: number };
}
export interface ProductImage {
  id: string;
  url: string;
}
export interface ProductFormDto {
  name: string;
  desc: string;
  price: number;
  inStock: number;
  status: "Active" | "Draft";
  categoryId: number;
}

export interface StatusGroup {
  _count: { id: number };
  status: "Active" | "Draft";
}

export interface InStockGroup {
  _count: { id: number };
  inStock: number;
}
export interface CategoryGroup {
  _count: { id: number };
  categoryId: number;
}
