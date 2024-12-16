import type { NextApiRequest, NextApiResponse } from "next";

// Define types
type Variant = {
  id: number;
  name: string;
  price: number;
};

type Order = {
  id: number;
  productId: number;
  productType: string;
  variant: Variant;
  quantity: number;
  price: number;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:mm:ss
};

const orders: Order[] = [
  {
    id: 1,
    productId: 2,
    productType: "Croissant",
    variant: { id: 1, name: "Chocolate", price: 5 },
    quantity: 3,
    price: 15,
    date: "2024-12-16",
    time: "10:30:00",
  },
  {
    id: 2,
    productId: 1,
    productType: "Donut",
    variant: { id: 1, name: "Chocolate", price: 5 },
    quantity: 2,
    price: 10,
    date: "2024-12-16",
    time: "10:35:00",
  },
  {
    id: 3,
    productId: 1,
    productType: "Donut",
    variant: { id: 1, name: "Strawberry", price: 5 },
    quantity: 4,
    price: 20,
    date: "2024-12-16",
    time: "10:37:00",
  }
];

// API handler
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Get all orders
    res.status(200).json(orders);
  } else if (req.method === "POST") {
    // Validate and create a new order
    const { productId, productType, variant, quantity }: Partial<Order> = req.body;

    if (
      !productId ||
      !productType ||
      !variant ||
      !variant.id ||
      !variant.name ||
      variant.price === undefined ||
      quantity === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const price = variant.price * quantity;
    const now = new Date();
    const newOrder: Order = {
      id: orders.length + 1,
      productId,
      productType,
      variant,
      quantity,
      price,
      date: now.toISOString().split("T")[0], // Extracts YYYY-MM-DD
      time: now.toTimeString().split(" ")[0], // Extracts HH:mm:ss
    };

    orders.push(newOrder);
    res.status(201).json(newOrder);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
