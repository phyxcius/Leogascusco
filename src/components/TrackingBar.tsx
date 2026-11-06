import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, MapPin, ChevronRight, FileText } from 'lucide-react';

interface TrackingBarProps {
  onOpenTicket: () => void;
}

export const TrackingBar: React.FC<TrackingBarProps> = ({ onOpenTicket }) => {
  const { activeCustomerOrder, openAlertModal, alertModal } = useApp();

  if (!activeCustomerOrder || activeCustomerOrder.estado === 'completado') {
    return null;
  }

  // When centered modal is open, keep floating bar invisible to prevent duplicate UI
  if (alertModal) {
    return null;
  }

  const getEtapaLabel = (etapa: number) => {
    switch (etapa) {
      case 1:
        return '🛵 1. En Camino (Ruta GPS)';
      case 2:
        return '🚪 2. Repartidor en tu Puerta';
      case 3:
        return '✔️ 3. Balón Entregado';
      default:
        return '⏳ Asignando Repartidor';
    }
  };

  const getEtapaStyle = (etapa: number) => {
    switch (etapa) {
      case 1:
        return 'bg-purple-900 text-yellow-300 border-purple-700';
      case 2:
        return 'bg-emerald-600 text-white border-emerald-500 animate-pulse';
      case 3:
        return 'bg-indigo-900 text-white border-indigo-700';
      default:
        return 'bg-amber-600 text-white border-amber-500';
    }
  };

  return (
    <div className="fixed top-20 sm:top-20 md:top-20 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-md sm:max-w-xl md:max-w-2xl animate-in slide-in-from-top-3 duration-300 pointer-events-auto">
      <div
        onClick={() => openAlertModal()}
        className="bg-white/95 backdrop-blur-md border-2 border-purple-500 rounded-2xl shadow-2xl p-2.5 sm:p-3 md:p-3.5 cursor-pointer hover:shadow-purple-500/20 hover:scale-[1.01] transition flex items-center justify-between gap-2 sm:gap-3"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 shadow-xs">
            {activeCustomerOrder.etapa === 2 ? '🚪' : activeCustomerOrder.etapa === 1 ? '🛵' : '⏳'}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 rounded-full border shadow-xs ${getEtapaStyle(activeCustomerOrder.etapa)}`}>
                {getEtapaLabel(activeCustomerOrder.etapa)}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-black text-slate-900 truncate mt-0.5">
              {activeCustomerOrder.tipoBalon}
            </p>

            <p className="text-[10px] sm:text-xs text-slate-600 truncate flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-700 inline flex-shrink-0" />
              <span>
                Repartidor:{' '}
                <strong className="text-purple-950 font-bold">
                  {activeCustomerOrder.repartidorNombre || 'Asignando...'}
                </strong>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenTicket();
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            title="Ver Comprobante Digital"
            aria-label="Ver Comprobante"
          >
            <FileText className="w-4 h-4 text-purple-800" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openAlertModal();
            }}
            className="bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 text-white text-[11px] sm:text-xs font-black px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer min-h-[38px]"
          >
            <Bell className="w-3.5 h-3.5 text-yellow-300 animate-bounce flex-shrink-0" />
            <span className="hidden xs:inline">Ver Alerta</span>
            <span className="xs:hidden">Alerta</span>
            <ChevronRight className="w-3.5 h-3.5 text-purple-200 flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
