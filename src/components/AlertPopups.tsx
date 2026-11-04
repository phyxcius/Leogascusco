import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { playAndSpeak, playSuccessChime } from '../utils/audio';
import { MapPin, CheckCircle, Clock, Truck, ShieldCheck, X, FileText, ChevronRight, Star, ExternalLink, MessageCircle } from 'lucide-react';

interface AlertPopupsProps {
  onOpenTicket?: () => void;
}

export const AlertPopups: React.FC<AlertPopupsProps> = ({ onOpenTicket }) => {
  const {
    alertModal,
    closeAlertModal,
    notificarClienteSaliendo,
    activeCustomerOrder,
    negocio
  } = useApp();

  const [clienteAvisoEnviado, setClienteAvisoEnviado] = useState(false);

  // Read notification aloud via the voice agent when modal opens
  useEffect(() => {
    if (alertModal === 'completado') {
      playAndSpeak(
        `¡Muchas gracias por su compra en ${negocio.nombre || 'LeoGas Cusco'}! Su pedido ha sido entregado exitosamente. Por favor califíquenos con 5 estrellas en Google.`,
        true
      );
    } else if (alertModal === 'en_puerta') {
      playAndSpeak(
        `¡Atención! Su repartidor ${activeCustomerOrder?.repartidorNombre || ''} ya está en su puerta. Por favor presione salir a recibir.`
      );
    } else if (alertModal === 'en_camino') {
      playAndSpeak(
        `¡Atención! Su balón de gas está en camino. Su repartidor ${activeCustomerOrder?.repartidorNombre || ''} va hacia su domicilio.`
      );
    } else if (alertModal === 'asignando') {
      playAndSpeak(
        `Su pedido de balón de gas ha sido registrado con éxito. Estamos asignando a su repartidor más cercano.`
      );
    }
  }, [alertModal]);

  // Reset aviso enviado when stage changes
  useEffect(() => {
    if (activeCustomerOrder?.etapa !== 2) {
      setClienteAvisoEnviado(false);
    }
  }, [activeCustomerOrder?.etapa]);

  if (!alertModal) return null;

  const repartidorNombre = activeCustomerOrder?.repartidorNombre || 'Repartidor asignado de LeoGas';
  const nombreNegocio = negocio.nombre || 'LeoGas Cusco';

  const handleSalirARecibir = () => {
    if (activeCustomerOrder?.id) {
      notificarClienteSaliendo(activeCustomerOrder.id);
      setClienteAvisoEnviado(true);
      playSuccessChime();
    } else {
      closeAlertModal();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-sm sm:max-w-md w-full rounded-3xl p-5 sm:p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-purple-400 relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Close / Minimize button in upper right */}
        <button
          type="button"
          onClick={closeAlertModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition cursor-pointer z-10"
          title="Minimizar en segundo plano"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ================= ETAPA 0: ASIGNANDO REPARTIDOR ================= */}
        {alertModal === 'asignando' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto shadow-inner animate-pulse">
              ⏳🛵
            </div>

            <span className="bg-amber-100 text-amber-900 font-black text-[10px] uppercase px-3 py-1 rounded-full inline-block">
              Estado: Pedido Registrado
            </span>

            <h3 className="text-lg sm:text-xl font-black text-amber-900 leading-tight">
              ¡Estamos Asignando tu Repartidor!
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tu solicitud para <strong>{nombreNegocio}</strong> ha sido recibida con éxito. Nuestro despachador está asignando la moto de reparto más cercana en Cusco.
            </p>

            {/* Order details card */}
            {activeCustomerOrder && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-bold text-slate-900">{activeCustomerOrder.tipoBalon}</span>
                  <strong className="text-purple-900 font-black text-sm">S/ {activeCustomerOrder.montoCobro}</strong>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-purple-700 inline" />
                  <span>{activeCustomerOrder.direccion || 'Cusco'}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200">
                  <span>Pago: <strong>{activeCustomerOrder.metodoPago}</strong></span>
                  <span>Hora: <strong>{activeCustomerOrder.hora}</strong></span>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={closeAlertModal}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md"
              >
                👍 ¡Entendido, esperando asignación!
              </button>
            </div>
          </div>
        )}

        {/* ================= ETAPA 1: EN CAMINO ================= */}
        {alertModal === 'en_camino' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-3xl mx-auto shadow-inner animate-bounce">
              🛵🔥
            </div>

            <span className="bg-purple-100 text-purple-900 font-black text-[10px] uppercase px-3 py-1 rounded-full inline-block">
              Etapa 1: En Camino (Ruta Activa)
            </span>

            <h3 className="text-xl font-black text-purple-950 leading-tight">
              ¡Tu Balón está en Camino!
            </h3>

            <p className="text-xs text-slate-700 leading-relaxed">
              Tu repartidor <strong>{repartidorNombre}</strong> de <strong>{nombreNegocio}</strong> ya salió de la base con tu pedido y viene en ruta directa a tu domicilio.
            </p>

            {/* Stepper Progress */}
            <div className="grid grid-cols-3 gap-1.5 text-[9px] font-black uppercase text-center">
              <div className="bg-purple-700 text-white py-1.5 rounded-lg shadow-xs">
                1. En Camino ✔
              </div>
              <div className="bg-slate-100 text-slate-400 py-1.5 rounded-lg">
                2. En Puerta
              </div>
              <div className="bg-slate-100 text-slate-400 py-1.5 rounded-lg">
                3. Entregado
              </div>
            </div>

            {/* Order details */}
            {activeCustomerOrder && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-left space-y-1 text-xs">
                <div className="flex justify-between items-center text-purple-950">
                  <span className="font-bold">{activeCustomerOrder.tipoBalon}</span>
                  <span className="font-black text-sm">S/ {activeCustomerOrder.montoCobro}</span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-purple-700 inline" />
                  <span className="truncate">{activeCustomerOrder.direccion || 'Cusco'}</span>
                </div>
                <div className="text-[10px] text-purple-800 font-bold pt-1 border-t border-purple-200">
                  ⏱️ Tiempo estimado: 10 - 15 minutos
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500">
              💡 Ten listo tu método de pago ({activeCustomerOrder?.metodoPago || 'Efectivo/Yape'}) y el balón vacío si es con canje.
            </p>

            <button
              type="button"
              onClick={closeAlertModal}
              className="w-full bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 text-white font-black py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md"
            >
              ¡Excelente, estaré atento! 🗺️
            </button>
          </div>
        )}

        {/* ================= ETAPA 2: REPARTIDOR EN PUERTA ================= */}
        {alertModal === 'en_puerta' && (
          <div className="space-y-4">
            <div className="w-18 h-18 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mx-auto shadow-inner animate-pulse">
              🚪🦁
            </div>

            <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase px-3 py-1 rounded-full inline-block">
              Etapa 2: Repartidor en tu Puerta
            </span>

            <h3 className="text-xl font-black text-emerald-800 leading-tight">
              ¡Tu Repartidor ya está en la Puerta!
            </h3>

            <p className="text-xs text-slate-700 leading-relaxed">
              ¡Tu repartidor <strong>{repartidorNombre}</strong> acaba de llegar a tu puerta con tu balón de gas!
            </p>

            {/* Stepper Progress */}
            <div className="grid grid-cols-3 gap-1.5 text-[9px] font-black uppercase text-center">
              <div className="bg-purple-200 text-purple-800 py-1.5 rounded-lg">
                1. En Camino
              </div>
              <div className="bg-emerald-600 text-white py-1.5 rounded-lg shadow-sm animate-pulse">
                2. En Puerta ✔
              </div>
              <div className="bg-slate-100 text-slate-400 py-1.5 rounded-lg">
                3. Entregado
              </div>
            </div>

            {clienteAvisoEnviado ? (
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-3 text-xs text-emerald-900 font-bold animate-in fade-in space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>¡Aviso enviado a {repartidorNombre}!</span>
                </div>
                <p className="text-[11px] text-emerald-800 font-normal">
                  Tu repartidor ya sabe que estás saliendo. Por favor abre la puerta para recibir tu gas.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 font-bold">
                🔔 Por favor presiona el botón para avisarle a tu repartidor que estás saliendo a recibir el balón:
              </div>
            )}

            <button
              type="button"
              onClick={handleSalirARecibir}
              className={`w-full py-3.5 rounded-2xl text-sm font-black transition cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                clienteAvisoEnviado
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-white" />
              <span>{clienteAvisoEnviado ? '¡Aviso Enviado! (Salir a Recibir)' : 'Salir a Recibir ✔️'}</span>
            </button>

            <button
              type="button"
              onClick={closeAlertModal}
              className="text-xs text-slate-400 hover:text-slate-600 underline font-semibold transition"
            >
              Minimizar ventana
            </button>
          </div>
        )}

        {/* ================= ETAPA 3: COMPLETADO / AGRADECIMIENTO, RESEÑA GOOGLE Y REDES SOCIALES ================= */}
        {alertModal === 'completado' && (
          <div className="space-y-4">
            <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-purple-200 to-yellow-200 text-purple-900 flex items-center justify-center text-4xl mx-auto shadow-inner animate-bounce">
              🦁✨
            </div>

            <span className="bg-purple-100 text-purple-900 font-black text-[10px] uppercase px-3 py-1 rounded-full inline-block">
              Etapa 3: Entrega Exitosa
            </span>

            <h3 className="text-xl font-black text-purple-950 leading-tight">
              ¡Muchas Gracias por tu Compra!
            </h3>

            <p className="text-xs text-slate-700 leading-relaxed">
              Tu pedido ha sido entregado exitosamente por <strong>{repartidorNombre}</strong>.
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-xs text-purple-950 font-semibold space-y-1">
              <p className="font-bold">
                ❤️ En <strong>{nombreNegocio}</strong> te agradecemos por tu preferencia.
              </p>
              <p className="text-[11px] text-purple-800">
                ¡Que disfrutes de una cocina segura y rendidora en tu hogar o negocio!
              </p>
            </div>

            {/* SECCIÓN GOOGLE MAPS REVIEW (RESEÑA 5 ESTRELLAS) */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-yellow-400 rounded-2xl p-3.5 space-y-2 text-center shadow-xs">
              <div className="flex justify-center items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <p className="text-xs font-black text-amber-950 leading-tight">
                ¿Qué te pareció nuestro servicio de gas hoy?
              </p>
              <p className="text-[10px] text-amber-800">
                Tu calificación nos ayuda a seguir brindando la entrega más rápida de Cusco.
              </p>
              <a
                href={negocio.googleReviewUrl || 'https://maps.google.com/?cid=leogascusco'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                <span>⭐⭐⭐⭐⭐ Dejar Reseña en Google Maps</span>
                <ExternalLink className="w-3 h-3 text-amber-100" />
              </a>
            </div>

            {/* REDES SOCIALES DEL NEGOCIO */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-500 block">
                ¡Síguenos en Nuestras Redes Oficiales!
              </span>
              <div className="grid grid-cols-4 gap-2">
                {/* Facebook */}
                <a
                  href={negocio.facebookUrl || 'https://facebook.com/leogascusco'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 p-2 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">📘</span>
                  <span>Facebook</span>
                </a>

                {/* Instagram */}
                <a
                  href={negocio.instagramUrl || 'https://instagram.com/leogascusco'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 p-2 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">📷</span>
                  <span>Instagram</span>
                </a>

                {/* TikTok */}
                <a
                  href={negocio.tiktokUrl || 'https://tiktok.com/@leogascusco'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 p-2 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">🎵</span>
                  <span>TikTok</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${negocio.whatsapp || '51969773064'}?text=${encodeURIComponent(
                    `Hola ${nombreNegocio}, acabo de recibir mi pedido de gas con éxito. ¡Muchas gracias!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 p-2 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">💬</span>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {onOpenTicket && (
              <button
                type="button"
                onClick={() => {
                  closeAlertModal();
                  onOpenTicket();
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-purple-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200"
              >
                <FileText className="w-3.5 h-3.5 text-purple-700" />
                <span>Ver Comprobante Digital (Boleta / Factura)</span>
              </button>
            )}

            <button
              type="button"
              onClick={closeAlertModal}
              className="w-full bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 text-white font-black py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md"
            >
              ¡Muchas Gracias! ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
