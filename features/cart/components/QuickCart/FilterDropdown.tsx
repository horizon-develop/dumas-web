import React, { useState } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
  options: { id: number; name: string }[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  placeholder: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = React.memo(({
  label,
  options,
  selectedIds,
  onToggle,
  placeholder,
  icon,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const normalizedSearch = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return options.filter(option => {
      const normalizedOption = option.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedOption.includes(normalizedSearch);
    });
  }, [options, search]);

  const handleSelect = (id: number) => {
    onToggle(id);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectedIds.forEach(id => onToggle(id));
  };

  const handleToggle = () => {
    if (!loading) {
      setIsOpen(prev => !prev);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (loading) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-full max-w-full">
      <div
        role="button"
        tabIndex={loading ? -1 : 0}
        aria-disabled={loading}
        aria-expanded={isOpen}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`w-full px-4 sm:px-5 py-3 rounded-lg text-left transition-all text-sm sm:text-base flex items-center justify-between shadow bg-white border ${
          selectedIds.length > 0
            ? 'border-red-400 text-red-700 ring-1 ring-red-400 ring-opacity-30' 
            : 'border-gray-200 hover:border-red-200 focus:ring-2 focus:ring-red-200 focus:border-red-200'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
          <span className="truncate font-semibold text-sm sm:text-base">
            {selectedIds.length > 0
              ? `${selectedIds.length} seleccionada${selectedIds.length > 1 ? 's' : ''}`
              : placeholder}
          </span>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {selectedIds.length > 0 && (
            <button
              onClick={clearSelection}
              type="button"
              className="text-red-500 hover:text-red-700 p-0.5"
              title="Limpiar"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <ChevronDown className={`h-5 w-5 text-red-400 transition-transform duration-300 ${isOpen ? 'rotate-180 scale-110' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeDropdown}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 max-h-[60vh] border border-gray-100 animate-fade-in overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-red-50 via-white to-gray-100 rounded-t-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-300 h-4 w-4" />
                <input
                  type="text"
                  placeholder={`Buscar en ${label.toLowerCase()}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-[48vh] overflow-y-auto">
              {filteredOptions.length > 0 ? (
                <div className="py-2">
                  {filteredOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center px-4 py-3 hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer text-base rounded-xl mb-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(option.id)}
                        onChange={() => handleSelect(option.id)}
                        className="mr-3 rounded border-gray-300 text-red-600 focus:ring-red-400 scale-110"
                      />
                      <span className="truncate font-medium">{option.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-base text-gray-500 text-center">
                  No se encontraron opciones
                  {search && (
                    <div className="mt-2">
            <button
              onClick={() => setSearch('')}
              className="text-red-600 hover:text-red-700 text-sm underline"
            >
              Limpiar búsqueda
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

FilterDropdown.displayName = 'FilterDropdown';

export default FilterDropdown;
