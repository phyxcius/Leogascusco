import React from 'react';
import { useApp } from '../context/AppContext';
import { Phone, MessageCircle } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';

export const FlyerSection: React.FC = () => {
  const { telefonos, negocio } = useApp();

  return (
    <section className="max-w-6xl mx-auto my-6 px-4">
      <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border-2 border-yellow-300 flex flex-col md:flex-row items-center gap-6">
        {/* Flyer Image */}
        <div className="w-full md:w-1/3 max-w-[280px]">
          <img
            src={
              negocio.imagenPresentacion
                ? (negocio.imagenPresentacion.startsWith('data:') || negocio.imagenPresentacion.startsWith('http')
                    ? negocio.imagenPresentacion
                    : getAssetUrl(negocio.imagenPresentacion))
                : getAssetUrl('1791513590376.jpg')
            }
            alt={`Flyer ${negocio.nombre}`}
            className="w-full h-auto rounded-xl shadow-md border border-slate-200 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getAssetUrl('1791513590376.jpg');
            }}
          />
        </div>

        {/* Info & Call buttons */}
        <div className="flex-1 text-center md:text-left">
          <span className="text-xs font-black uppercase text-amber-600 tracking-wider">
            Atención Rápida a Domicilio
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5 mb-1">
            Central de Pedidos {negocio.nombre}
          </h3>
          <p className="text-sm font-bold text-amber-800 mb-3">
            {negocio.slogan} • Calidad, Seguridad y Peso Exacto
          </p>
          <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
            Llegamos a todo Cusco, San Sebastián, San Jerónimo, Wanchaq, Santiago y Centro Histórico. Llámanos directamente o pide por WhatsApp con un solo clic.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-4">
            {telefonos.tel1 && (
              <a
                href={`tel:${telefonos.tel1.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 px-3 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-slate-800 transition"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{telefonos.tel1}</span>
              </a>
            )}
            {telefonos.tel2 && (
              <a
                href={`tel:${telefonos.tel2.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 px-3 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-slate-800 transition"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{telefonos.tel2}</span>
              </a>
            )}
            {telefonos.tel3 && (
              <a
                href={`tel:${telefonos.tel3.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 px-3 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-slate-800 transition"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{telefonos.tel3}</span>
              </a>
            )}
          </div>
          <a
            href={`https://wa.me/${telefonos.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
              `¡Hola ${negocio.nombre || 'La Chuspa Tech'}! Deseo consultar sobre balones de gas a domicilio.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chatear por WhatsApp ({telefonos.whatsapp})</span>
          </a>
        </div>
      </div>
    </section>
  );
};
