'use client';
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="w-16 md:w-64 bg-white border-r border-gray-200 p-4">
      {/* Logo */}
      <div className="flex items-center mb-8">
        <h1 className="hidden md:block text-3xl font-bold text-black">RAZPOS</h1>
        <h1 className="block md:hidden text-xl font-bold text-black text-center w-full">R</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6 hidden md:block">
        <input
          type="search"
          placeholder="Search"
          className="w-full text-black px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300"
        />
      </div>

      {/* Navigation Links */}
      <nav className="space-y-2">
        {[
          { href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", text: "Home" },
          { href: "/kitchen", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", text: "Kitchen" },
          { href: "/inventory", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", text: "Inventory" },
          { href: "/orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", text: "Orders" },
          { href: "/reporting", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", text: "Reporting" },
        ].map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
          >
            <div className="flex flex-col items-center md:flex-row md:items-start w-full">
              <svg className="w-5 h-5 stroke-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              <span className="text-xs text-black block md:hidden">{item.text}</span>
              <span className="text-black hidden md:block md:ml-3">{item.text}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 w-16 md:w-64 p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100">
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-black">Sheikh Musa</p>
            <p className="text-xs text-gray-500">musa@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
