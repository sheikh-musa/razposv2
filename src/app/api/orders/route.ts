import { NextResponse } from "next/server";

// Define types
type Variant = {
    productId: number;
    name: string;
    price: number;
    orderQuantity: number;
};
type Product = {
    type: string;
    variants: Variant[];
  };
type Order = {
    id: number;
    itemsType: number;
    variantType: number;
    product: Product[];
    totalPrice: number;
    date: string; // Format: YYYY-MM-DD
    time: string; // Format: HH:mm:ss
    paymentBy: string;
    paymentReceived: boolean;
    completed: boolean;
    remarks: string;
};
// type Order = {
//     date: string; // Format: YYYY-MM-DD
//     time: string; // Format: HH:mm:ss
//     order: Details[];
// }
const orders: Order[] = [
    {
      id: 1,
      itemsType: 2,
      variantType: 3,
      product: [
        {
          type: "Croissant",
          variants: [
            {  productId: 1, name: "Chocolate", price: 5, orderQuantity: 3 },
            { productId: 2, name: "Plain", price: 3, orderQuantity: 2 },
          ],
        },
        {
          type: "Donut",
          variants: [
            { productId: 3, name: "Plain", price: 3, orderQuantity: 5 },
          ],
        },
      ],
      totalPrice: 34,
      date: "2024-12-16",
      time: "10:30:00",
      paymentBy: "Paynow",
      paymentReceived: true,
      completed: true,
      remarks: "more chilli",
    },
    {
      id: 2,
      itemsType: 1,
      variantType: 1,
      product: [
        {
          type: "Pastries",
          variants: [
            { productId: 1, name: "Chicken ham & cheese", price: 5.5, orderQuantity: 3 },
          ],
        },
      ],
      totalPrice: 16.5,
      date: "2024-12-18",
      time: "12:30:00",
      paymentBy: "Cash",
      paymentReceived: true,
      completed: true,
      remarks: "more chilli",
    },
    {
      id: 3,
      itemsType: 2,
      variantType: 2,
      product: [
        {
          type: "Bagels",
          variants: [
            { productId: 1, name: "Blueberry", price: 4, orderQuantity: 4 },
            { productId: 2, name: "Sesame", price: 4.5, orderQuantity: 3 },
          ],
        },
      ],
      totalPrice: 28.5,
      date: "2024-12-19",
      time: "15:00:00",
      paymentBy: "Credit Card",
      paymentReceived: true,
      completed: false,
      remarks: "",
    },
    {
      id: 4,
      itemsType: 3,
      variantType: 5,
      product: [
        {
          type: "Muffins",
          variants: [
            { productId: 1, name: "Chocolate Chip", price: 4, orderQuantity: 5 },
            { productId: 2, name: "Banana Walnut", price: 4.5, orderQuantity: 3 },
          ],
        },
        {
          type: "Cookies",
          variants: [
            { productId: 3, name: "Peanut Butter", price: 2.5, orderQuantity: 6 },
          ],
        },
        {
          type: "Bagels",
          variants: [
            {  productId: 4, name: "Blueberry", price: 4, orderQuantity: 4 },
            { productId: 5, name: "Sesame", price: 4.5, orderQuantity: 3 },
          ],
        },
      ],
      totalPrice: 42.5,
      date: "2024-12-20",
      time: "14:00:00",
      paymentBy: "Cash",
      paymentReceived: false,
      completed: false,
      remarks: "more chilli",
    },
    {
      id: 5,
      itemsType: 1,
      variantType: 1,
      product: [
        {
          type: "Donut",
          variants: [
            {  productId: 1, name: "Strawberry", price: 5, orderQuantity: 6 },
          ],
        },
      ],
      totalPrice: 30,
      date: "2024-12-21",
      time: "09:30:00",
      paymentBy: "Paynow",
      paymentReceived: true,
      completed: false,
      remarks: "none",
    },
  ];
  

// API handler
export async function GET() {
    return NextResponse.json(orders);
  }


  
