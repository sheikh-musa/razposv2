"use client";

import "./globals.css";
import Navbar from "./components/navbar";
import { CartProvider } from "./context/CartContext";
import { ApiProvider } from "./context/ApiContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
        <ApiProvider>
          <CartProvider>
            <div className="flex h-screen bg-white">
              <Navbar />
              <div className="flex-1 overflow-auto m-5">{children}</div>
            </div>
          </CartProvider>
        </ApiProvider>
      </body>
    </html>
  );
}
