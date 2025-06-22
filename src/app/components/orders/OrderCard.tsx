import Image from 'next/image';
import { ItemTemplate, ItemWithPrice } from '@/app/context/types/ERPNext';

type OrderCardProps = {
  product: {
    name: string;
    item_name: string;
    variants: ItemWithPrice[];
  };
  onQuantityChange: (productName: string, variantName: string, change: number) => void;
  onAddToOrder: (product: ItemTemplate, variant: ItemWithPrice) => void;
};

export default function OrderCard({ product, onQuantityChange, onAddToOrder }: OrderCardProps) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-md text-black border-solid border mb-2">
      <h2 className="text-md text-gray-500 font-semibold mb-4">{product.item_name}</h2>
      <div className="space-y-4">
        {product.variants.map((variant) => (
          <div key={variant.name} className="flex items-center gap-4">
            <div className="w-32 h-24 relative rounded-lg overflow-hidden">
              <Image
                // src="https://www.spatuladesserts.com/wp-content/uploads/2024/03/Chocolate-Puff-Pastry-00418.jpg"
                src={variant.image ? `${process.env.NEXT_PUBLIC_API_URL}/${variant.image}` : 'https://www.spatuladesserts.com/wp-content/uploads/2024/03/Chocolate-Puff-Pastry-00418.jpg'}
                alt={variant.item_name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{variant.item_name}</h3>
              <p className="text-sm text-gray-600">${variant.price?.price_list_rate.toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => onQuantityChange(product.name, variant.name, -1)}
                    className="px-3 py-1 border-r hover:bg-gray-50 text-black"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-black">{variant.quantity || 1}</span>
                  <button
                    onClick={() => onQuantityChange(product.name, variant.name, 1)}
                    className="px-3 py-1 border-l hover:bg-gray-50 text-black"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => onAddToOrder(product, variant)}
                  className="px-4 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
