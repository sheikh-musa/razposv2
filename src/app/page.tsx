// import Image from "next/image";
// import Navbar from "./components/navbar";
"use client";
import Home from "./home/page";
import { useApi } from "./context/ApiContext";
import { useEffect } from "react";

function CustomFieldsInitializer() {
  const { initializeCustomFields } = useApi();

  useEffect(() => {
    // Only run in production or when explicitly needed
    console.log('initializing custom fields');
    initializeCustomFields().catch(console.error);
    
  }, [initializeCustomFields]);

  return null;
}

export default function Main() {
  return (
    <>
      <CustomFieldsInitializer />
      <Home />
    </>
    
  );
}
