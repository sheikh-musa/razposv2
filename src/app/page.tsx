// import Image from "next/image";
// import Navbar from "./components/navbar";
"use client";
import Home from "./home/page";
import { useApi } from "./context/ApiContext";
import { useEffect } from "react";

function CustomFieldsInitializer() {
  const { initializeCustomFields, checkGuestCustomerExists, createGuestCustomer, initializeModeOfPayment } = useApi();

  useEffect(() => {
    // Only run in production or when explicitly needed
    console.log('initializing custom fields');
    initializeCustomFields().catch(console.error);
    initializeModeOfPayment().catch(console.error);
    checkGuestCustomerExists().then(exists => {
      if (!exists) {
        createGuestCustomer().catch(console.error);
      }
    });
  }, [initializeCustomFields, checkGuestCustomerExists, createGuestCustomer, initializeModeOfPayment]);

  return null;

  // async function checkGuest() {
  //   const exists = await checkGuestCustomerExists();
  //   console.log('Guest customer exists:', exists);
  // }
}



export default function Main() {
  return (
    <>
      <CustomFieldsInitializer />
      <Home />
    </>
    
  );
}
