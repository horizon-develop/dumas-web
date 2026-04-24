import { FiShoppingCart } from "react-icons/fi";
import { ProductClientResponse } from "../types/productDto";
import { useCart } from "../../cart/context/CartContext";
import { toast } from "react-hot-toast";
import { getUserData, isAuthenticated as checkAuth } from "../../auth/utils/authUtils";

export const ProductCard: React.FC<{
    product: ProductClientResponse;
    isAuthenticated: boolean;
    userProfile: string | undefined;
    addToCart?: (id: number) => void
  }> = ({ product, isAuthenticated, userProfile }) => {
    const { addItem } = useCart();
    const user = getUserData();

    const effectiveAuth = Boolean(isAuthenticated) || checkAuth();

    const getPriceForProfile = () => {
      if (product.currentPrice !== undefined && product.currentPrice !== null) {
        return product.currentPrice;
      }

      const profile = userProfile || user?.clientDetails?.profile || "PETSHOP";

      if (profile === "VETERINARIA") {
        return product.veterinariaPrice ?? 0;
      }
      if (profile === "FORRAJERIA") {
        return product.forrajeriaPrice ?? 0;
      }
      return product.petshopPrice ?? 0;
    };

    const displayPrice = getPriceForProfile();
 
    const handleAdd = async () => {
      if (!effectiveAuth) {
        toast("Debes iniciar sesión para agregar productos", {
          position: "top-right",
          duration: 2500,
          icon: "ℹ️",
        });
        window.dispatchEvent(new Event("auth-open-login"));
        return;
      }
      try {
        await addItem({
          productId: product.id,
          productName: product.name,
          unitPrice: displayPrice,
          urlImage: product.urlImage,
          subtotal: displayPrice,
        }, 1);
      } catch (error) {
      }
    };
 
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group border border-gray-100">
        <div className="aspect-square bg-gray-50 relative">
          {product.urlImage ? (
            <img
              src={product.urlImage}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <span className="absolute top-1.5 right-1.5 bg-[#8B0000] text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold shadow">
            {product.category?.name}
          </span>
        </div>
  
        <div className="p-3 flex flex-col justify-between flex-grow">
          <div>
            <div className="flex items-start justify-between mb-1 gap-2">
              <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 flex-grow">{product.name}</h3>
              <span className="text-[10px] mt-0.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 flex-shrink-0 whitespace-nowrap">
                {product.brand?.name}
              </span>
            </div>
            
            <p className="text-gray-600 text-xs mb-2 line-clamp-2">{product.description}</p>
            
            <div className="flex items-end justify-between mb-2">
              <div>
                {isAuthenticated ? (
                  <span className="text-base font-bold text-[#8B0000]">
                    ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                ) : (
                  <div className="text-gray-600 text-xs">
                    Inicia sesión para ver precios
                  </div>
                )}
              </div>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium flex items-center ${
                product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {product.stock > 0 ? product.stock : "Agotado"}
              </span>
            </div>
          </div>
         <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`w-full py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm font-medium ${
              product.stock > 0 && effectiveAuth
                ? 'bg-[#8B0000] text-white hover:bg-[#6A0000]'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
             <FiShoppingCart size={16} />
             <span>{product.stock > 0 ? 'Agregar' : 'Agotado'}</span>
           </button>
        </div>
      </div>
    );
  };
