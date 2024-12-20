import { NextResponse } from "next/server";

// Define types
type Variant = {
    name: string;
    price: number;
    productId: number;
    orderQuantity: number;
};
type Product = {
    type: string;
    variants: Variant[];
  };
type Order = {
    id: number;
    itemsType: number;
    product: Product[];
    totalPrice: number;
    date: string; // Format: YYYY-MM-DD
    time: string; // Format: HH:mm:ss
    paymentBy: string;
    completed: boolean;
};

const orders: Order[] = [
    {
      id: 1,
      itemsType: 2,
      product: [
        {
          type: "Croissant",
          variants: [
            { name: "Chocolate", price: 5, productId: 1, orderQuantity: 3 },
            { name: "Plain", price: 3, productId: 2, orderQuantity: 2 },
          ],
        },
        {
          type: "Donut",
          variants: [
            { name: "Plain", price: 3, productId: 3, orderQuantity: 5 },
          ],
        },
      ],
      totalPrice: 34,
      date: "2024-12-16",
      time: "10:30:00",
      paymentBy: "Paynow",
      completed: true,
    },
    {
      id: 2,
      itemsType: 1,
      product: [
        {
          type: "Pastries",
          variants: [
            { name: "Chicken ham and cheese", price: 5.5, productId: 1, orderQuantity: 3 },
          ],
        },
      ],
      totalPrice: 16.5,
      date: "2024-12-18",
      time: "12:30:00",
      paymentBy: "Cash",
      completed: true,
    },
    {
      id: 3,
      itemsType: 3,
      product: [
        {
          type: "Bagels",
          variants: [
            { name: "Blueberry", price: 4, productId: 1, orderQuantity: 4 },
            { name: "Sesame", price: 4.5, productId: 3, orderQuantity: 3 },
          ],
        },
      ],
      totalPrice: 28.5,
      date: "2024-12-19",
      time: "15:00:00",
      paymentBy: "Credit Card",
      completed: false,
    },
    {
      id: 4,
      itemsType: 2,
      product: [
        {
          type: "Muffins",
          variants: [
            { name: "Chocolate Chip", price: 4, productId: 1, orderQuantity: 5 },
            { name: "Banana Walnut", price: 4.5, productId: 2, orderQuantity: 3 },
          ],
        },
        {
          type: "Cookies",
          variants: [
            { name: "Peanut Butter", price: 2.5, productId: 3, orderQuantity: 6 },
          ],
        },
      ],
      totalPrice: 42.5,
      date: "2024-12-20",
      time: "14:00:00",
      paymentBy: "Cash",
      completed: false,
    },
    {
      id: 5,
      itemsType: 1,
      product: [
        {
          type: "Donut",
          variants: [
            { name: "Strawberry", price: 5, productId: 2, orderQuantity: 6 },
          ],
        },
      ],
      totalPrice: 30,
      date: "2024-12-21",
      time: "09:30:00",
      paymentBy: "Paynow",
      completed: false,
    },
  ];
  

// API handler
export async function GET() {
    return NextResponse.json(orders);
  }


  
