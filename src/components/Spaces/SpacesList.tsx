import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useSpaces } from '../../context/SpaceContext';
import { useAuth } from '../../context/AuthContext';
import { Space } from '../../types';
import SpaceCard from './SpaceCard';
import SpaceForm from './SpaceForm';
import ReservationModal from '../Reservations/ReservationModal';

const SpacesList: React.FC = () => {
  const { user } = useAuth();
  const { spaces, spacesError, loadSpaces, deleteSpace, isLoadingSpaces } = useSpaces();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showSpaceForm, setShowSpaceForm] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [reservingSpaceId, setReservingSpaceId] = useState<string | null>(null);
  const [hasRequestedSpaces, setHasRequestedSpaces] = useState(false);

  const spaceTypes = [
    { value: '', label: 'Todos los tipos' },
    { value: 'deportivo', label: 'Deportivo' },
    { value: 'social', label: 'Social' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'bbq', label: 'BBQ' },
    { value: 'auditorio', label: 'Auditorio' },
    { value: 'salon', label: 'Salón' },
  ];

  useEffect(() => {
    if (!user) {
      if (hasRequestedSpaces) {
        setHasRequestedSpaces(false);
      }
      return;
    }

    if (hasRequestedSpaces) {
      return;
    }

    setHasRequestedSpaces(true);

    if (!isLoadingSpaces && spaces.length === 0) {
      void loadSpaces();
    }
  }, [user, hasRequestedSpaces, isLoadingSpaces, spaces.length, loadSpaces]);

  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (space.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || space.type === selectedType;
    return matchesSearch && matchesType;
  });

  const isInitialLoad = isLoadingSpaces && spaces.length === 0;
  const isUpdatingSpaces = isLoadingSpaces && spaces.length > 0;

  const handleEditSpace = (space: Space) => {
    setEditingSpace(space);
    setShowSpaceForm(true);
  };

  const handleDeleteSpace = (spaceId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este espacio?')) {
      deleteSpace(spaceId);
    }
  };

  const handleReserve = (spaceId: string) => {
    setReservingSpaceId(spaceId);
  };

  const handleCloseSpaceForm = () => {
    setShowSpaceForm(false);
    setEditingSpace(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-slide-in-up">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">Espacios Comunitarios</h1>
          <p className="text-neutral-600 mt-2 text-base">
            {user?.role === 'admin'
              ? 'Gestiona los espacios disponibles para la comunidad'
              : 'Encuentra y reserva el espacio perfecto para tu evento'
            }
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => setShowSpaceForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo Espacio</span>
          </button>
        )}
      </div>

      {spacesError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-medium">{spacesError}</p>
          <button
            onClick={() => { void loadSpaces(); }}
            className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-neutral-100/50 p-6 mb-8 hover:shadow-lg transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar espacios por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-12"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input pl-12 appearance-none cursor-pointer"
            >
              {spaceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-700">
            {isUpdatingSpaces ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                Actualizando espacios...
              </span>
            ) : (
              `Mostrando ${filteredSpaces.length} de ${spaces.length} espacios`
            )}
          </p>
          {(searchTerm || selectedType) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
              }}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {isInitialLoad ? (
        <div className="text-center py-16 animate-scale-in">
          <div className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl p-12 max-w-md mx-auto border border-neutral-100/50 shadow-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-white/30 border-t-white"></div>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              Cargando espacios disponibles
            </h3>
            <p className="text-neutral-600">
              Esto puede tardar unos segundos mientras obtenemos la información desde el servidor.
            </p>
          </div>
        </div>
      ) : filteredSpaces.length > 0 ? (
        <div className="relative">
          {isUpdatingSpaces ? (
            <div className="absolute inset-x-0 -top-6 flex justify-center">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                Actualizando listado…
              </span>
            </div>
          ) : null}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map(space => (
              <SpaceCard
                key={space.id}
                space={space}
                onReserve={handleReserve}
                onEdit={user?.role === 'admin' ? handleEditSpace : undefined}
                onDelete={user?.role === 'admin' ? handleDeleteSpace : undefined}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 animate-scale-in">
          <div className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl p-12 max-w-md mx-auto border border-neutral-100/50 shadow-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
              <Search className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              No se encontraron espacios
            </h3>
            <p className="text-neutral-600 mb-6">
              Intenta cambiar los filtros o términos de búsqueda
            </p>
            {searchTerm || selectedType ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('');
                }}
                className="btn btn-primary"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Modals */}
      {showSpaceForm && (
        <SpaceForm
          space={editingSpace}
          onClose={handleCloseSpaceForm}
        />
      )}

      {reservingSpaceId && (
        <ReservationModal
          spaceId={reservingSpaceId}
          onClose={() => setReservingSpaceId(null)}
        />
      )}
    </div>
  );
};

export default SpacesList;