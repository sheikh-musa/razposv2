import type { NextApiRequest, NextApiResponse } from "next";

// Define types
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

// API handler
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Get all products
    res.status(200).json(products);
  } else if (req.method === "POST") {
    const { type, variant }: Partial<Product & { variant: Partial<Variant> }> = req.body;

    if (type && variant) {
      // Add a new product
      if (!variant.name || variant.price === undefined || variant.stock === undefined) {
        return res.status(400).json({ error: "Missing required fields for variant" });
      }

      const newProduct: Product = {
        id: products.length + 1,
        type,
        variants: [
          {
            id: 1, // First variant for the new product
            name: variant.name,
            price: variant.price,
            stock: variant.stock,
          },
        ],
      };

      products.push(newProduct);
      return res.status(201).json(newProduct);
    } else if (variant && variant.name && variant.price !== undefined && variant.stock !== undefined) {
      // Add a new variant to an existing product
      const productId = req.body.productId;

      const product = products.find((p) => p.id === productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const newVariant: Variant = {
        id: product.variants.length + 1,
        name: variant.name,
        price: variant.price,
        stock: variant.stock,
      };

      product.variants.push(newVariant);
      return res.status(201).json(product);
    } else {
      return res.status(400).json({ error: "Missing required fields for product or variant" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
