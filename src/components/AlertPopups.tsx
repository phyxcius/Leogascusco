import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { playChimeSound, playSuccessChime } from '../utils/audio';

export const AlertPopups: React.FC = () => {
  const { alertModal, closeAlertModal, activeCustomerOrder, negocio } = useApp();

  useEffect(() => {
    if (alertModal === 'completado') {
      playSuccessChime();
    } else if (alertModal) {
      playChimeSound();
    }
  }, [alertModal]);

  if (!alertModal) return null;

  const repartidorNombre = activeCustomerOrder?.repartidorNombre || 'Tu repartidor asignado';
  const nombreNegocio = negocio.nombre || 'LeoGas Cusco';

  return (
    <div className="fixed inset-0 z-[9999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-3xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-purple-300">
        {alertModal === 'en_camino' && (
          <div>
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner animate-bounce">
              🛵🔥
            </div>
            <span className="bg-red-100 text-red-700 font-black text-[10px] uppercase px-3 py-1 rounded-full inline-block mb-2">
              Etapa 1: En Camino
            </span>
            <h3 className="text-xl font-black text-red-700 mb-1 leading-tight">
              ¡Tu Balón está en Camino!
            </h3>
            <p className="text-xs text-slate-700 mb-2 leading-relaxed">
              <strong>{repartidorNombre}</strong> de <strong>{nombreNegocio}</strong> ya salió de la base hacia tu domicilio con tu pedido.
            </p>
            <p className="text-[11px] text-slate-400 mb-5">
              Ten listo tu método de pago y el balón vacío si es con canje.
            </p>
            <button
              type="button"
              onClick={closeAlertModal}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl text-sm transition cursor-pointer shadow-md"
            >
              ¡Excelente, estaré atento! 🗺️
            </button>
          </div>
        )}

        {alertModal === 'en_puerta' && (
          <div>
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner animate-pulse">
              🚪🦁
            </div>
            <span className="bg-emerald-100 text-emerald-700 font-black text-[10px] uppercase px-3 py-1 rounded-full inline-block mb-2">
              Etapa 2: Repartidor en Puerta
            </span>
            <h3 className="text-xl font-black text-emerald-700 mb-1 leading-tight">
              ¡Repartidor en tu Puerta!
            </h3>
            <p className="text-xs text-slate-700 mb-2 leading-relaxed">
              ¡Tu repartidor <strong>{repartidorNombre}</strong> acaba de llegar afuera de tu domicilio con tu balón de gas!
            </p>
            <p className="text-[11px] text-emerald-600 font-bold mb-5">
              🔔 Por favor sal a recibir tu balón. ¡Estamos listos para atenderte!
            </p>
            <button
              type="button"
              onClick={closeAlertModal}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-sm transition cursor-pointer shadow-md"
            >
              Salir a Recibir ✔️
            </button>
          </div>
        )}

        {alertModal === 'completado' && (
          <div>
            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
              🦁✨
            </div>
            <span className="bg-purple-100 text-purple-800 font-black text-[10px] uppercase px-3 py-1 rounded-full inline-block mb-2">
              Etapa 3: Entrega Exitosa
            </span>
            <h3 className="text-xl font-black text-purple-900 mb-1 leading-tight">
              ¡Muchas Gracias por tu Compra!
            </h3>
            <p className="text-xs text-slate-700 mb-3 leading-relaxed">
              Tu pedido ha sido entregado exitosamente por <strong>{repartidorNombre}</strong>.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-xs text-purple-950 font-bold mb-5">
              ❤️ En <strong>{nombreNegocio}</strong> te agradecemos por tu preferencia. ¡Que disfrutes de una cocina segura y rendidora!
            </div>
            <button
              type="button"
              onClick={closeAlertModal}
              className="w-full bg-purple-800 hover:bg-purple-900 text-white font-black py-3 rounded-xl text-sm transition cursor-pointer shadow-md"
            >
              ¡Muchas Gracias! ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
