import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiCreditCard, FiDollarSign, FiTruck } from "react-icons/fi";
import { toast } from "react-hot-toast";
import MercadoPagoButton from "../../payment/components/MercadoPagoButton";
import AddressSelector from "../../user/components/AddressSelector";
import CurrentDebt from "../../user/components/AccountBalance";
import { useMercadoPago } from "../../payment/api/MercadoPagoContext";
import { Address } from "../../address/types/address";
import { getUserData, isAuthenticated } from "../../auth/utils/authUtils";
import { checkoutOrder } from "../../order/api/orderApi";
import type { CheckoutRequest } from "../../order/types/order";
import type { User } from "../../user/types/user";
import { createAddress } from "../../address/api/addressApi";
import { CreateAddressRequest } from "../../address/types/addressDto";
import { useCart } from "../context/CartContext";
import { getErrorMessage } from "../../../shared/types/apiError";

interface CheckoutFormInputs {
  fullName: string;
  email: string;
  country: string;
  province: string;
  city: string;
  postalCode?: string;
  street: string;
  streetNumber: string;
  additionalInfo?: string;
  paymentMethod: "mercadopago" | "efectivo" | "transferencia" | "cuenta_corriente";
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items: cartItems, total } = useCart();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [, setCurrentDebt] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { isProcessing, setIsProcessing } = useMercadoPago();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormInputs>({
    mode: "onChange",
    defaultValues: {
      paymentMethod: "mercadopago",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const watchedFields = watch();

  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = getUserData();
        if (userData) {
          setCurrentUser(userData);
          
          setValue("email", userData.email);
          setValue("fullName", userData.name || "");

          if (userData.clientDetails) {
            if (!userData.name && userData.clientDetails.legalCompanyName) {
              setValue("fullName", userData.clientDetails.legalCompanyName);
            }
          }
        }
      } catch (error) {
      }
    };

    loadUserData();
  }, [setValue]);

  useEffect(() => {
    const handleSessionExpiry = () => {
      setIsProcessing(false);
      toast.error("Tu sesión expiró. Inicia sesión para continuar con el checkout.", {
        position: "top-right",
      });
      window.dispatchEvent(new Event("auth-open-login"));
    };

    window.addEventListener("auth-logout", handleSessionExpiry);
    if (!isAuthenticated()) {
      handleSessionExpiry();
    }
    return () => {
      window.removeEventListener("auth-logout", handleSessionExpiry);
    };
  }, [setIsProcessing]);

  useEffect(() => {
    if (selectedAddress) {
      setValue("fullName", selectedAddress.fullName || watchedFields.fullName || "");
      setValue("country", selectedAddress.country || "");
      setValue("province", selectedAddress.province || "");
      setValue("city", selectedAddress.city || "");
      setValue("postalCode", selectedAddress.postalCode || "");
      setValue("street", selectedAddress.street || "");
      setValue("streetNumber", selectedAddress.streetNumber || "");
      setValue("additionalInfo", selectedAddress.additionalInfo || "");
    }
  }, [selectedAddress, setValue, watchedFields.fullName]);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setSelectedAddress(prev => ({
      ...prev,
      [field]: value
    }));
    const formKeys: Array<keyof CheckoutFormInputs> = [
      "fullName",
      "email",
      "country",
      "province",
      "city",
      "postalCode",
      "street",
      "streetNumber",
      "additionalInfo"
    ];
    if ((formKeys as string[]).includes(field as string)) {
      setValue(field as keyof CheckoutFormInputs, value);
    }
  };

  const buildCheckoutRequest = async (
    paymentMethod: CheckoutRequest["paymentMethod"]
  ): Promise<CheckoutRequest | null> => {
    if (!cartItems || cartItems.length === 0) {
      toast.error("El carrito está vacío");
      return null;
    }

    if (!selectedAddress) {
      toast.error("Por favor selecciona una dirección");
      return null;
    }

    let addressId = selectedAddress.id;

    if (!addressId) {
      if (!selectedAddress.fullName || !selectedAddress.country || !selectedAddress.province ||
          !selectedAddress.city || !selectedAddress.street || !selectedAddress.streetNumber) {
        toast.error("Por favor completa todos los campos requeridos de la dirección");
        return null;
      }

      const addressDTO: CreateAddressRequest = {
        fullName: selectedAddress.fullName,
        country: selectedAddress.country,
        province: selectedAddress.province,
        city: selectedAddress.city,
        postalCode: selectedAddress.postalCode || "",
        street: selectedAddress.street,
        streetNumber: selectedAddress.streetNumber,
        additionalInfo: selectedAddress.additionalInfo || "",
        label: selectedAddress.label || "Casa",
      };

      const createdAddress = await createAddress(addressDTO);
      addressId = createdAddress.id;
      setSelectedAddress(prev => ({
        ...(prev || {}),
        id: createdAddress.id,
        fullName: createdAddress.fullName,
        country: createdAddress.country,
        province: createdAddress.province,
        city: createdAddress.city,
        postalCode: createdAddress.postalCode || "",
        street: createdAddress.street,
        streetNumber: createdAddress.streetNumber,
        additionalInfo: createdAddress.additionalInfo || "",
        label: createdAddress.label || "Casa",
      }));
      toast.success("Dirección registrada exitosamente");
    }

    const totalAmount = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

    return {
      addressId,
      paymentMethod,
      items: cartItems,
      total: totalAmount,
    };
  };

  const onSubmit: SubmitHandler<CheckoutFormInputs> = async (data) => {
    if (!isAuthenticated()) {
      toast.error("Debes iniciar sesión para confirmar tu pedido.");
      window.dispatchEvent(new Event("auth-open-login"));
      return;
    }
    if (data.paymentMethod === "mercadopago") {
      return;
    }

    try {
      const orderData = await buildCheckoutRequest(data.paymentMethod);
      if (!orderData) return;

      const response = await checkoutOrder(orderData);
      
      if (data.paymentMethod === "cuenta_corriente") {
        toast.success("Pedido confirmado. El monto se ha agregado a tu cuenta corriente. Debes coordinar el pago con Dumas.");
      } else if (data.paymentMethod === "transferencia") {
        toast.success("Pedido confirmado. Recibirás las instrucciones de transferencia por email.");
      } else {
        toast.success("Pedido confirmado exitosamente.");
      }
      
      navigate(`/order-confirmation/${response.id}`, {
        state: {
          orderNumber: response.orderNumber,
          orderDate: response.orderDate,
        }
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const isFormValid = () => {
    const requiredFields = [
      "fullName", "email", "country", "province",
      "city", "street", "streetNumber"
    ];

    const formValues = watch();
    return requiredFields.every(field => !!formValues[field as keyof CheckoutFormInputs]);
  };

  const getPaymentMethodInfo = (method: string) => {
    switch (method) {
      case "mercadopago":
        return {
          icon: <FiCreditCard className="w-5 h-5" />,
          title: "Mercado Pago",
          description: "Pago seguro con tarjetas, efectivo o transferencia"
        };
      case "cuenta_corriente":
        return {
          icon: <FiDollarSign className="w-5 h-5" />,
          title: "Cuenta Corriente",
          description: "Realizar el pedido y luego coordinar con Dumas para el pago."
        };
      case "transferencia":
        return {
          icon: <FiCreditCard className="w-5 h-5" />,
          title: "Transferencia Bancaria",
          description: "Realizar transferencia a nuestra cuenta bancaria"
        };
      case "efectivo":
        return {
          icon: <FiTruck className="w-5 h-5" />,
          title: "Contraentrega",
          description: "Pagar en efectivo al recibir el pedido"
        };
      default:
        return null;
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-auto mt-12"
      >
        <h2 className="text-2xl font-bold mb-4">Carrito vacío</h2>
        <button
          onClick={() => navigate("/shop")}
          className="bg-[#8B0000] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6A0000] transition-colors"
        >
          Volver a la tienda
        </button>
      </motion.div>
    );
  }

  return (
    <div className="relative bg-gray-50 min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 flex items-center gap-4"
        >
          <FiArrowLeft
            onClick={() => navigate(-1)}
            className="text-2xl text-red-600 cursor-pointer hover:text-red-700"
          />
          <h1 className="text-2xl lg:text-3xl font-bold text-red-600">Finalizar Compra</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-red-600 mb-6 border-b-2 border-red-100 pb-4">
              Información del Pedido
            </h2>

            {currentUser && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-blue-900">
                      Pedido para: {currentUser.name || currentUser.email}
                    </h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Los datos se han cargado automáticamente desde tu perfil. 
                      Puedes modificarlos si es necesario.
                    </p>
                    {currentUser.clientDetails && (
                      <div className="mt-2 text-xs text-blue-600">
                        <span className="font-medium">{currentUser.clientDetails.profile}</span>
                        {currentUser.clientDetails.legalCompanyName && (
                          <span> - {currentUser.clientDetails.legalCompanyName}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <motion.div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Información de Contacto</h3>
                <div className="relative">
                  <input
                    {...register("email", {
                      required: "Email es requerido",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Email inválido"
                      }
                    })}
                    placeholder="Email"
                    type="email"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600"
                  />
                  {currentUser && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Auto-cargado
                      </span>
                    </div>
                  )}
                </div>
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email.message}</span>
                )}
              </motion.div>

              <motion.div className="space-y-4">
                <AddressSelector
                  selectedAddress={selectedAddress}
                  onAddressSelect={handleAddressSelect}
                  onAddressChange={handleAddressChange}
                  currentUser={currentUser} 
                />
              </motion.div>

              <motion.div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Método de Pago</h3>

                <div className="grid gap-3">
                  {[
                    { value: "mercadopago", ...getPaymentMethodInfo("mercadopago")! },
                    ...(currentUser?.role === "CLIENTE" ? [{ value: "cuenta_corriente", ...getPaymentMethodInfo("cuenta_corriente")! }] : []),
                    { value: "transferencia", ...getPaymentMethodInfo("transferencia")! },
                    { value: "efectivo", ...getPaymentMethodInfo("efectivo")! }
                  ].map((method) => (
                    <div key={method.value} className="space-y-2">
                      <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === method.value
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}>
                        <input
                          type="radio"
                          value={method.value}
                          {...register("paymentMethod")}
                          className="h-4 w-4 text-red-600 focus:ring-red-600 mr-3"
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`p-2 rounded-full ${
                            paymentMethod === method.value
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {method.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{method.title}</h4>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </div>
                        </div>
                      </label>

                      <AnimatePresence>
                        {paymentMethod === method.value && method.value === "cuenta_corriente" && (
                          <CurrentDebt
                            orderTotal={total}
                            isSelected={true}
                            onDebtLoad={setCurrentDebt}
                          />
                        )}
                        
                        {paymentMethod === method.value && method.value === "transferencia" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <h4 className="font-semibold text-gray-800 mb-2">Información Bancaria</h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium">CBU:</span> 0000000000000000000000</p>
                              <p><span className="font-medium">Alias:</span> ejemplo.ejemplo.ejemplo</p>
                              <p><span className="font-medium">Titular:</span> Dumas Distribuciones</p>
                              <p className="text-gray-600 mt-2">
                                Te enviaremos las instrucciones detalladas por email una vez confirmado el pedido.
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {paymentMethod === method.value && method.value === "efectivo" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-4 p-4 bg-amber-50 rounded-lg border border-amber-200"
                          >
                            <div className="flex items-start space-x-2">
                              <FiTruck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-amber-800 mb-1">Pago Contraentrega</h4>
                                <p className="text-sm text-amber-700">
                                  Podrás pagar en efectivo cuando recibas tu pedido. 
                                  Se puede aplicar un cargo adicional por envío.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>

              {paymentMethod === "mercadopago" ? (
                <MercadoPagoButton
                  isDisabled={!isFormValid() || isProcessing}
                  getCheckoutData={() => buildCheckoutRequest("mercadopago")}
                />
              ) : (
                <button
                  type="submit"
                  disabled={!isFormValid()}
                  className={`w-full py-4 rounded-lg font-semibold transition-all ${
                    !isFormValid()
                      ? "bg-gray-400 cursor-not-allowed text-gray-600"
                      : "bg-[#8B0000] text-white hover:bg-[#6A0000] hover:shadow-lg"
                  }`}
                >
                  Confirmar Pedido
                </button>
              )}
            </form>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 h-fit sticky top-4"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-red-600 mb-6 border-b-2 border-red-100 pb-4">
              Resumen del Pedido
            </h2>

            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center pb-3 border-b last:border-0"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="font-semibold text-gray-800 truncate">{item.productName}</h3>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold text-red-600 flex-shrink-0">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </p>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-4 space-y-3"
              >
                <div className="flex justify-between font-bold border-t pt-3 text-lg">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-red-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
