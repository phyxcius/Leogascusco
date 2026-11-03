import React from 'react';
import { useApp } from '../context/AppContext';

export const AlertPopups: React.FC = () => {
  const { alertModal, closeAlertModal } = useApp();

  if (!alertModal) return null;

  return (
    <div className="fixed inset-0 z-[4000] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-3xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        {alertModal === 'en_camino' && (
          <div>
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
              🛵🔥
            </div>
            <h3 className="text-xl font-black text-red-700 mb-1">
              ¡Tu Balón está en Camino!
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              El repartidor de LeoGas Cusco ya salió de la base con tu pedido hacia tu dirección.
            </p>
            <button
              type="button"
              onClick={closeAlertModal}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 rounded-xl text-sm transition cursor-pointer shadow-md"
            >
              Entendido 🗺️
            </button>
          </div>
        )}

        {alertModal === 'en_puerta' && (
          <div>
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
              🚪🦁
            </div>
            <h3 className="text-xl font-black text-emerald-700 mb-1">
              ¡Repartidor en tu Puerta!
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              El repartidor de LeoGas Cusco ya llegó afuera de tu domicilio con tu balón de gas.
            </p>
            <button
              type="button"
              onClick={closeAlertModal}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-sm transition cursor-pointer shadow-md"
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
            <h3 className="text-xl font-black text-purple-900 mb-1">
              ¡Pedido Finalizado con Éxito!
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              Tu pedido ha sido entregado correctamente. ¡Muchas gracias por confiar en LeoGas Cusco (Llamagas)!
            </p>
            <button
              type="button"
              onClick={closeAlertModal}
              className="w-full bg-purple-800 hover:bg-purple-900 text-white font-extrabold py-3 rounded-xl text-sm transition cursor-pointer shadow-md"
            >
              ¡Muchas Gracias! ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
