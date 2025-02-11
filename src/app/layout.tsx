import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/navbar";
import { CartProvider } from './context/CartContext';
import { ApiProvider } from './context/ApiContext';

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata: Metadata = {
  title: "Razpos",
  description: "POS Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ApiProvider>
          <CartProvider>
            <div className="flex h-screen bg-white">
              <Navbar />
              <div className="flex-1 overflow-auto m-5">
                {children}
              </div>
            </div>
          </CartProvider>
        </ApiProvider>
      </body>
    </html>
  );
}
