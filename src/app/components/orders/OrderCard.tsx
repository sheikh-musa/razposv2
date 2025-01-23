import Image from 'next/image';

type Variant = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type Product = {
  id: number;
  type: string;
  variants: Variant[];
};

type OrderCardProps = {
  product: Product;
  onQuantityChange: (productId: number, variantId: number, change: number) => void;
  onAddToOrder: (product: Product, variant: Variant) => void;
};

export default function OrderCard({ product, onQuantityChange, onAddToOrder }: OrderCardProps) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-md text-black border-solid border mb-2">
      <h2 className="text-md text-gray-500 font-semibold mb-4">{product.type}</h2>
      <div className="space-y-4">
        {product.variants.map((variant) => (
          <div key={variant.id} className="flex items-center gap-4">
            <div className="w-32 h-24 relative rounded-lg overflow-hidden">
              <Image
                src="https://www.spatuladesserts.com/wp-content/uploads/2024/03/Chocolate-Puff-Pastry-00418.jpg"
                alt={variant.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{variant.name}</h3>
              <p className="text-sm text-gray-600">${variant.price.toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => onQuantityChange(product.id, variant.id, -1)}
                    className="px-3 py-1 border-r hover:bg-gray-50 text-black"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-black">{variant.quantity || 1}</span>
                  <button
                    onClick={() => onQuantityChange(product.id, variant.id, 1)}
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
