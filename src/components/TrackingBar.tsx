import React from 'react';
import { useApp } from '../context/AppContext';
import { FileText, MapPin } from 'lucide-react';

interface TrackingBarProps {
  onOpenTicket: () => void;
}

export const TrackingBar: React.FC<TrackingBarProps> = ({ onOpenTicket }) => {
  const { activeCustomerOrder } = useApp();

  if (!activeCustomerOrder || activeCustomerOrder.estado === 'completado') {
    return null;
  }

  const getEtapaLabel = (etapa: number) => {
    switch (etapa) {
      case 1:
        return '🛵 1. En Camino';
      case 2:
        return '🚪 2. En Puerta';
      case 3:
        return '✔️ 3. Entregado';
      default:
        return '⏳ Asignando Repartidor';
    }
  };

  const getEtapaBg = (etapa: number) => {
    switch (etapa) {
      case 1:
        return 'bg-purple-800 text-white';
      case 2:
        return 'bg-emerald-600 text-white';
      case 3:
        return 'bg-purple-900 text-yellow-300';
      default:
        return 'bg-amber-500 text-white';
    }
  };

  return (
    <div className="sticky top-[61px] z-40 bg-gradient-to-r from-yellow-100 via-yellow-200 to-amber-200 border-b-2 border-yellow-400 px-4 py-2 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl animate-bounce">🛵</span>
          <div>
            <div className="font-extrabold text-purple-950 text-xs sm:text-sm">
              Tu pedido de gas está activo: {activeCustomerOrder.tipoBalon}
            </div>
            <div className="text-[11px] text-slate-700 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-purple-700 inline" />
              <span>
                {activeCustomerOrder.direccion || 'Cusco'} • Repartidor:{' '}
                <strong>{activeCustomerOrder.repartidorNombre || 'Por asignar'}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-black px-3 py-1 rounded-full shadow-xs ${getEtapaBg(activeCustomerOrder.etapa)}`}>
            {getEtapaLabel(activeCustomerOrder.etapa)}
          </span>
          <button
            type="button"
            onClick={onOpenTicket}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Comprobante</span>
          </button>
        </div>
      </div>
    </div>
  );
};
