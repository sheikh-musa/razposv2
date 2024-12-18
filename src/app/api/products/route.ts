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

// POST method (Add a new product)
export async function POST(req: Request) {
  const body = await req.json(); // Parse the request body
  const { type, variants } = body;

  if (!type || !variants) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const newProduct: Product = {
    id: products.length + 1,
    type,
    variants,
  };

  products.push(newProduct); // Add to the in-memory list
  return NextResponse.json(newProduct, { status: 201 });
}

// PUT method (Update a product by ID)
export async function PUT(req: Request) {
  const body = await req.json();
  const { id, type, variants } = body;

  if (!id || (!type && !variants)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const product = products.find((p) => p.id === id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Update fields
  if (type) product.type = type;
  if (variants) product.variants = variants;

  return NextResponse.json(product, { status: 200 });
}

// DELETE method (Delete a product by ID)
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "0", 10);

  if (!id) {
    return NextResponse.json({ error: "Missing required product ID" }, { status: 400 });
  }

  const productIndex = products.findIndex((p) => p.id === id);
  if (productIndex === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  products.splice(productIndex, 1); // Remove the product
  return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
}