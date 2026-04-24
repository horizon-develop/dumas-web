import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { fetchQuickBuyProducts } from "../../features/product/api/productApi";
import type { QuickBuyProductResponse } from "../../features/product/types/productDto";
import { useCart } from "../../features/cart/context/CartContext";
import { getUserData, isAuthenticated } from "../../features/auth/utils/authUtils";
import { getPriceForUser } from "../utils/priceUtils";
import { formatCurrency } from "../utils/formatters";


const LiveSearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QuickBuyProductResponse[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<QuickBuyProductResponse | null>(null);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  const user = useMemo(() => getUserData(), []);

  const getPriceForProfile = useCallback((product: QuickBuyProductResponse): number => {
    return getPriceForUser(product, user);
  }, [user]);

  const fetchResults = async () => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const response = await fetchQuickBuyProducts({ name: trimmed });
      setResults(response.content || []);
      setShowDropdown(true);
    } catch (error) {
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => fetchResults(), 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    if (!pendingProduct) return;

    const handleLogin = () => {
      const price = getPriceForProfile(pendingProduct);
      addItem(
        {
          productId: pendingProduct.id,
          productName: pendingProduct.name,
          unitPrice: price,
          urlImage: pendingProduct.urlImage || "",
          subtotal: price,
        },
        1
      ).finally(() => setPendingProduct(null));
    };

    window.addEventListener("auth-login", handleLogin as EventListener);
    return () => window.removeEventListener("auth-login", handleLogin as EventListener);
  }, [pendingProduct, addItem, getPriceForProfile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-full sm:max-w-lg lg:max-w-xl min-w-0" ref={wrapperRef}>
      <div className="flex items-center border border-gray-300 rounded-full px-3 py-2 sm:py-2.5 bg-white shadow-sm focus-within:ring-2 focus-within:ring-red-200 transition-shadow">
        <FiSearch className="text-red-600 shrink-0" />
        <input
          type="text"
          className="ml-2 w-full min-w-0 outline-none text-sm sm:text-base"
          placeholder="Buscar producto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {showDropdown && results.length > 0 && (
        <ul className="absolute left-0 right-0 z-50 w-full bg-white border mt-1 rounded-lg shadow-lg max-h-64 sm:max-h-72 overflow-auto">
          {results.map((product) => (
            <li
              key={product.id}
              onClick={() => {
                setQuery("");
                setShowDropdown(false);
                navigate(`/shop?name=${encodeURIComponent(product.name)}`);
              }}
              className="flex items-center justify-between space-x-2 p-2 sm:p-3 hover:bg-red-50/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2">
                {product.urlImage && (
                  <img src={product.urlImage} alt={product.name} className="w-8 h-8 object-cover rounded sm:w-10 sm:h-10" />
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-sm sm:text-base">{product.name}</span>
                  <span className="text-xs text-gray-500">{product.brand.name}</span>
                  <span className="text-xs text-red-700 font-semibold">
                    {formatCurrency(getPriceForProfile(product))}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated()) {
                    toast("Debes iniciar sesión para agregar productos", {
                      position: "top-right",
                      duration: 2500,
                      icon: "ℹ️",
                    });
                    window.dispatchEvent(new Event("auth-open-login"));
                    setShowDropdown(false);
                    setQuery("");
                    setPendingProduct(product);
                    return;
                  }

                  const price = getPriceForProfile(product);

                  addItem(
                    {
                      productId: product.id,
                      productName: product.name,
                      unitPrice: price,
                      urlImage: product.urlImage || "",
                      subtotal: price,
                    },
                    1
                  ).catch(() => {});
                }}
                className="text-xs sm:text-sm bg-[#8B0000] hover:bg-[#6A0000] text-white px-2 sm:px-3 py-1 rounded shadow-sm"
              >
                Agregar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LiveSearchBar;
