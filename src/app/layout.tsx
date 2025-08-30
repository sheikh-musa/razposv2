"use client";

import "./globals.css";
import Navbar from "./components/navbar";
import { CartProvider } from "./context/CartContext";
import { ApiProvider } from "./context/ApiContext";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import ConnectionStatus from "./components/ConnectionStatus";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="RAZPOS - Point of Sale System" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RAZPOS" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="mobile-friendly" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
        <ConnectionStatus />
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
            <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-screen">
              <Navbar />
              {/* Main content that properly accounts for sidebar width */}
              <main className="main-content-with-sidebar py-4 px-4 sm:px-6 lg:px-6 lg:py-6 safe-area-inset">
                  <div className="w-full">{children}</div>
                </main>
              </div>
            </Suspense>
          </CartProvider>
        </ApiProvider>
      </body>
    </html>
  );
}
