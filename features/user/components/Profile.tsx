import React, { useEffect, useState } from "react";
import { isAuthenticated, storeUserData, getUserData } from '../../auth/utils/authUtils';
import type { User } from '../types/user';
import { getCurrentDebt, updateProfile } from '../api/userApi';
import { FiDollarSign, FiMapPin } from 'react-icons/fi';

interface ProfileProps {
  onClose: () => void;
  onShowChangePassword?: () => void;
  onShowAddresses?: () => void;
}

const Profile: React.FC<ProfileProps> = ({
  onClose,
  onShowChangePassword,
  onShowAddresses
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [oldUser, setOldUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [currentDebt, setCurrentDebt] = useState<number>(0);
  const [loadingDebt, setLoadingDebt] = useState(false);

  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUser(userData);
      setOldUser({ ...userData });
    }
  }, []);

  useEffect(() => {
    const loadCurrentDebt = async () => {
      if (user?.clientDetails && user.role === 'CLIENTE') {
        try {
          setLoadingDebt(true);
          const debt = await getCurrentDebt();
          setCurrentDebt(debt);
        } catch (error) {
          setCurrentDebt(0);
        } finally {
          setLoadingDebt(false);
        }
      }
    };

    loadCurrentDebt();
  }, [user]);

  const handleSaveClick = async () => {
    if (!user) return;

    if (!isAuthenticated()) {
      setError("No estás autenticado.");
      return;
    }

    try {
      const updatedUser = await updateProfile({
        name: user.name,
        email: user.email,
        taxId: user.clientDetails?.taxId,
        legalCompanyName: user.clientDetails?.legalCompanyName,
        phoneNumber: user.clientDetails?.phoneNumber,
        profile: user.clientDetails?.profile,
      });

      setMessage("Perfil actualizado correctamente");
      setUser(updatedUser);
      setOldUser(updatedUser);
      storeUserData(updatedUser);
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleCancelEdit = () => {
    setUser(oldUser);
    setIsEditing(false);
    setError(null);
    setMessage(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser(prev => prev ? { ...prev, name: e.target.value } : prev);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser(prev => prev ? { ...prev, email: e.target.value } : prev);
  };

  const handleTaxIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser(prev => prev ? {
      ...prev,
      clientDetails: prev.clientDetails
        ? { ...prev.clientDetails, taxId: e.target.value }
        : { taxId: e.target.value, legalCompanyName: '', phoneNumber: '', profile: 'PETSHOP' }
    } : prev);
  };

  const handleLegalCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser(prev => prev ? {
      ...prev,
      clientDetails: prev.clientDetails
        ? { ...prev.clientDetails, legalCompanyName: e.target.value }
        : { taxId: '', legalCompanyName: e.target.value, phoneNumber: '', profile: 'PETSHOP' }
    } : prev);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser(prev => prev ? {
      ...prev,
      clientDetails: prev.clientDetails
        ? { ...prev.clientDetails, phoneNumber: e.target.value }
        : { taxId: '', legalCompanyName: '', phoneNumber: e.target.value, profile: 'PETSHOP' }
    } : prev);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 font-bold text-lg mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setUser(oldUser);
              setIsEditing(false);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 font-semibold text-lg">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 overflow-y-auto bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8B0000]/80">Tu cuenta</p>
          <h1 className="text-xl font-bold text-[#8B0000]">Perfil de Usuario</h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Cerrar
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {message}
        </div>
      )}

      <div className="flex-1">
        {!isEditing ? (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Datos básicos</div>
              <div className="space-y-2">
                <div>
                  <p className="text-[12px] text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium break-words">{user.email}</p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500">Nombre</p>
                  <p className="text-gray-900 font-medium">{user.name || 'No especificado'}</p>
                </div>
              </div>
            </div>

            {user.role === "CLIENTE" && user.clientDetails && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Datos del negocio</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[12px] text-gray-500">CUIT/CUIL</p>
                    <p className="text-gray-900 font-medium">{user.clientDetails.taxId || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500">Razón social</p>
                    <p className="text-gray-900 font-medium">{user.clientDetails.legalCompanyName || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500">Teléfono</p>
                    <p className="text-gray-900 font-medium">{user.clientDetails.phoneNumber || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500">Perfil</p>
                    <p className="text-gray-900 font-medium">{user.clientDetails.profile || 'No especificado'}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-700">Cuenta corriente</span>
                  </div>
                  {loadingDebt ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-blue-700">Cargando deuda...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-900">${currentDebt.toLocaleString()}</p>
                        <p className="text-xs text-blue-600">Deuda actual</p>
                      </div>
                      <FiDollarSign className="w-8 h-8 text-blue-500" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#8B0000] text-white py-3 rounded-lg hover:bg-[#6A0000] transition-colors font-medium"
              >
                Editar Perfil
              </button>

              {onShowAddresses && (
                <button
                  onClick={onShowAddresses}
                  className="w-full bg-[#8B0000] text-white py-3 rounded-lg hover:bg-[#6A0000] transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FiMapPin className="w-4 h-4" />
                  Mis Direcciones
                </button>
              )}

              {onShowChangePassword && (
                <button
                  onClick={onShowChangePassword}
                  className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Cambiar Contraseña
                </button>
              )}
            </div>
          </div>
        ) : (
          <form className="space-y-6 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                value={user.name || ''}
                onChange={handleNameChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                value={user.email}
                onChange={handleEmailChange}
                required
              />
            </div>

            {user.role === "CLIENTE" && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Cliente</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CUIT/CUIL *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                        value={user.clientDetails?.taxId || ''}
                        onChange={handleTaxIdChange}
                        pattern="\d{11}"
                        placeholder="12345678901"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Razón Social / Empresa *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                        value={user.clientDetails?.legalCompanyName || ''}
                        onChange={handleLegalCompanyNameChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
                        value={user.clientDetails?.phoneNumber || ''}
                        onChange={handlePhoneNumberChange}
                        placeholder="1234567890"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Perfil de Negocio</label>
                      <p className="text-gray-900 font-medium">{user.clientDetails?.profile}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveClick}
                className="w-full bg-[#8B0000] text-white py-3 rounded-lg hover:bg-[#6A0000] transition-colors font-medium"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
