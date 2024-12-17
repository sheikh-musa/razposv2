import { NextResponse } from "next/server";

type Variant = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

type Product = {
  id: number;
  type: string;
  variants: Variant[];
};

const products: Product[] = [
  {
    id: 1,
    type: "Donut",
    variants: [
      { id: 1, name: "Chocolate", price: 5, stock: 100 },
      { id: 2, name: "Strawberry", price: 5, stock: 100 },
      { id: 3, name: "Plain", price: 3, stock: 100 },
    ],
  },
  {
    id: 2,
    type: "Croissant",
    variants: [
      { id: 1, name: "Chocolate", price: 5, stock: 100 },
      { id: 2, name: "Plain", price: 3, stock: 100 },
    ],
  },
];

export async function GET() {
  return NextResponse.json(products);
}
