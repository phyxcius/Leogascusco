import React from 'react';
import { Zap, ShieldCheck, CreditCard, Navigation } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-300 py-10 px-4 text-center border-b-2 border-yellow-400">
      <div className="max-w-4xl mx-auto">
        <span className="inline-block bg-purple-800 text-white font-extrabold text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 shadow-xs">
          🦁 LeoGas Cusco • Distribuidor Oficial Llamagas
        </span>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-3">
          ¡El Balón de Gas Más Rápido y Seguro en Cusco!
        </h2>

        <p className="text-sm sm:text-base text-slate-700 font-semibold max-w-2xl mx-auto mb-6">
          Balones de 10kg y 45kg 100% sellados con precinto de garantía, peso exacto y válvula anti-fugas. Pide por WhatsApp o llamada con monitoreo GPS en vivo.
        </p>

        <div className="flex flex-wrap justify-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white py-1.5 px-3.5 rounded-full text-xs font-bold text-slate-800 shadow-xs border border-yellow-200">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Entrega Inmediata</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white py-1.5 px-3.5 rounded-full text-xs font-bold text-slate-800 shadow-xs border border-yellow-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Balón Sellado y Pesado</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white py-1.5 px-3.5 rounded-full text-xs font-bold text-slate-800 shadow-xs border border-yellow-200">
            <CreditCard className="w-3.5 h-3.5 text-purple-700" />
            <span>Yape, Plin y Efectivo</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white py-1.5 px-3.5 rounded-full text-xs font-bold text-slate-800 shadow-xs border border-yellow-200">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Seguimiento GPS en Ruta</span>
          </div>
        </div>
      </div>
    </section>
  );
};
