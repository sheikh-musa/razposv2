'use client';
import { useEffect } from "react";
import { useApi} from "../context/ApiContext";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";


export default function Payment() {
    const searchParams = useSearchParams();
    const order = searchParams?.get('order') || '';
    const { fetchKitchenOrderDetails } = useApi();
    const router = useRouter();
    // const [orderDetails, setOrderDetails] = useState<SalesOrders | null>(null);

    useEffect(() => {
        if (order) {
            fetchOrderDetails();
        }
        else {
            toast.error('No order found');
            router.push('/');
        }
        // eslint-disable-next-line
    }, [order]);

    const fetchOrderDetails = async () => {
        const orderDetails = await fetchKitchenOrderDetails(order);
        console.log(orderDetails);
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen text-black">
            <h1>Payment</h1>
        </div>
    );
}