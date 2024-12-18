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
  {
    id: 3,
    type: "Pastries",
    variants: [
      { id: 1, name: "Chicken ham and cheese", price: 5.5, stock: 100 },
      { id: 2, name: "Cinnamon roll", price: 4.5, stock: 100 },
      { id: 3, name: "Egg tart", price: 3, stock: 100 },
    ],
  },
  {
    id: 4,
    type: "Bagels",
    variants: [
      { id: 1, name: "Blueberry", price: 4, stock: 80 },
      { id: 2, name: "Plain", price: 3.5, stock: 100 },
      { id: 3, name: "Sesame", price: 4.5, stock: 90 },
    ],
  },
  {
    id: 5,
    type: "Muffins",
    variants: [
      { id: 1, name: "Chocolate Chip", price: 4, stock: 120 },
      { id: 2, name: "Banana Walnut", price: 4.5, stock: 110 },
      { id: 3, name: "Blueberry", price: 4.2, stock: 100 },
    ],
  },
  {
    id: 6,
    type: "Cookies",
    variants: [
      { id: 1, name: "Chocolate Chunk", price: 2.5, stock: 150 },
      { id: 2, name: "Oatmeal Raisin", price: 2, stock: 140 },
      { id: 3, name: "Peanut Butter", price: 2.5, stock: 130 },
    ],
  },
];


export async function GET() {
  return NextResponse.json(products);
}
