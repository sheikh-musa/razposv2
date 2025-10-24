'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function EditOrderPage() {
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState(null)

  const router = useRouter()
  useEffect(() => {
    const objectParam = searchParams?.get('object')
    if (objectParam) {
      try {
        const parsedOrderDetails = JSON.parse(objectParam)
        console.log('parsedOrderDetails', parsedOrderDetails)
        setOrderDetails(parsedOrderDetails)
      } catch (e) {
        console.log('Error parsing order details:', e)
        toast.error('Order not found')
        setTimeout(() => {
          router.push('/tickets')
        }, 1000)

      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Now you can use orderDetails in your component
  return (
    <div>
      {orderDetails && (
        <div>
          <h1>Edit Order: {JSON.stringify(orderDetails)}</h1>
          {/* Render your edit form here */}
        </div>
      )}
    </div>
  )
}