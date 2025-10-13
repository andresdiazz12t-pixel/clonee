import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useSpaces } from '../../context/SpaceContext';
import { useAuth } from '../../context/AuthContext';
import { Space } from '../../types';
import SpaceCard from './SpaceCard';
import SpaceForm from './SpaceForm';
import ReservationModal from '../Reservations/ReservationModal';

const SpacesList: React.FC = () => {
  const { user } = useAuth();
  const { spaces, spacesError, loadSpaces, deleteSpace } = useSpaces();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showSpaceForm, setShowSpaceForm] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [reservingSpaceId, setReservingSpaceId] = useState<string | null>(null);

  const spaceTypes = [
    { value: '', label: 'Todos los tipos' },
    { value: 'deportivo', label: 'Deportivo' },
    { value: 'social', label: 'Social' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'bbq', label: 'BBQ' },
    { value: 'auditorio', label: 'Auditorio' },
    { value: 'salon', label: 'Salón' },
  ];

  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || space.type === selectedType;
    return matchesSearch && matchesType;
  });

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Espacios Comunitarios</h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'admin' 
              ? 'Gestiona los espacios disponibles para la comunidad'
              : 'Encuentra y reserva el espacio perfecto para tu evento'
            }
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => setShowSpaceForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar espacios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              {spaceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredSpaces.length} de {spaces.length} espacios
        </div>
      </div>

      {/* Spaces Grid */}
      {filteredSpaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron espacios
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta cambiar los filtros o términos de búsqueda
            </p>
            {searchTerm || selectedType ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
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