import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { playAndSpeak, playSuccessChime, playChimeSound } from '../utils/audio';
import {
  MapPin,
  CheckCircle,
  Clock,
  Truck,
  ShieldCheck,
  X,
  FileText,
  ChevronRight,
  Star,
  ExternalLink,
  MessageCircle,
  Gift,
  Award,
  Sparkles,
  Search,
  CheckCircle2,
  Flame,
  Check
} from 'lucide-react';
import { formatWhatsAppNumber } from '../utils/assets';
import { ClienteFidelidad } from '../types/index';

interface AlertPopupsProps {
  onOpenTicket?: () => void;
}

export const AlertPopups: React.FC<AlertPopupsProps> = ({ onOpenTicket }) => {
  const {
    alertModal,
    closeAlertModal,
    notificarClienteSaliendo,
    activeCustomerOrder,
    negocio,
    telefonos,
    clubFidelidad,
    consultarSellos,
    sumarSelloFidelidad
  } = useApp();

  const [clienteAvisoEnviado, setClienteAvisoEnviado] = useState(false);

  // Club de Fidelidad state
  const [fidelidadDni, setFidelidadDni] = useState('');
  const [fidelidadCliente, setFidelidadCliente] = useState<ClienteFidelidad | null>(null);
  const [hasQueriedDni, setHasQueriedDni] = useState(false);
  const [alreadyStampedOrder, setAlreadyStampedOrder] = useState<string | null>(null);
  const [justStampedAlert, setJustStampedAlert] = useState<string | null>(null);

  // Read notification aloud via the voice agent when modal opens
  useEffect(() => {
    if (alertModal === 'completado') {
      playAndSpeak(
        `¡Muchas gracias por su compra en ${negocio.nombre || 'La Chuspa Tech'}! Su pedido ha sido entregado exitosamente. Por favor califíquenos con 5 estrellas en Google.`,
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

  const repartidorNombre =
    activeCustomerOrder?.repartidorNombre || `Repartidor asignado de ${negocio.nombre || 'La Chuspa Tech'}`;
  const nombreNegocio = negocio.nombre || 'La Chuspa Tech';

  const handleSalirARecibir = () => {
    if (clienteAvisoEnviado) {
      closeAlertModal();
      return;
    }
    if (activeCustomerOrder?.id) {
      notificarClienteSaliendo(activeCustomerOrder.id);
      setClienteAvisoEnviado(true);
      playSuccessChime();
      setTimeout(() => {
        closeAlertModal();
      }, 1800);
    } else {
      closeAlertModal();
    }
  };

  // Auto-fill DNI when completado modal opens
  useEffect(() => {
    if (alertModal === 'completado') {
      const orderDni =
        (activeCustomerOrder?.tipoComprobante?.match(/\d{8}/) || [])[0] ||
        (activeCustomerOrder?.cliente && /^\d{8}$/.test(activeCustomerOrder.cliente.trim())
          ? activeCustomerOrder.cliente.trim()
          : '') ||
        localStorage.getItem('leogas_last_dni') ||
        '';

      if (orderDni && !fidelidadDni) {
        setFidelidadDni(orderDni);
        const found = consultarSellos(orderDni);
        if (found) {
          setFidelidadCliente(found);
          setHasQueriedDni(true);
        }
      }
    }
  }, [alertModal, activeCustomerOrder?.id]);

  // Keep fidelidadCliente in sync with clubFidelidad
  useEffect(() => {
    if (fidelidadDni) {
      const found = consultarSellos(fidelidadDni);
      if (found) setFidelidadCliente(found);
    }
  }, [clubFidelidad]);

  // IMPORTANTE: este return va DESPUÉS de todos los hooks (useState/useEffect)
  if (!alertModal) return null;

  const handleConsultarFidelidad = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = fidelidadDni.trim().replace(/\D/g, '');
    if (clean.length < 8) {
      alert('Por favor ingresa un número de DNI válido (8 dígitos).');
      return;
    }
    localStorage.setItem('leogas_last_dni', clean);
    const found = consultarSellos(clean);
    setFidelidadCliente(found);
    setHasQueriedDni(true);
    if (found) {
      playSuccessChime();
    } else {
      playChimeSound();
    }
  };

  const handleSellarCompra = () => {
    const clean = fidelidadDni.trim().replace(/\D/g, '');
    if (clean.length < 8) {
      alert('Ingresa primero tu número de DNI (8 dígitos) para estampar tu sello.');
      return;
    }
    const orderId = activeCustomerOrder?.id || `pedido-${Date.now()}`;
    const result = sumarSelloFidelidad(
      clean,
      activeCustomerOrder?.cliente || fidelidadCliente?.nombre || `Cliente DNI ${clean}`,
      telefonos.whatsapp || '',
      `Consumo: ${activeCustomerOrder?.tipoBalon || 'Balón de Gas'}`,
      1
    );
    setFidelidadCliente(result.cliente);
    setHasQueriedDni(true);
    setAlreadyStampedOrder(orderId);
    playSuccessChime();

    if (result.premioDesbloqueado) {
      setJustStampedAlert(`🎉 ¡Felicidades! Has completado 10 sellos. ¡Tu regalito sorpresa está listo para reclamar!`);
      playAndSpeak(
        `¡Felicitaciones! Has completado tus diez sellos en el Club de Fidelidad de ${negocio.nombre || 'La Chuspa Tech'}. Ya puedes reclamar tu regalito.`,
        true
      );
    } else {
      setJustStampedAlert(
        `✔ ¡Sello estampado! Tienes ${result.cliente.sellos} de 10 sellos. Te faltan ${10 - result.cliente.sellos} para tu regalito.`
      );
      playAndSpeak(`¡Sello registrado! Tienes ${result.cliente.sellos} de diez sellos.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
      <div className="w-full max-w-[94vw] xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200 border-2 sm:border-4 border-purple-500 relative overflow-hidden my-auto max-h-[88dvh] sm:max-h-[86vh] overflow-y-auto overscroll-contain [scrollbar-width:thin]">
        {/* Close / Minimize button in upper right */}
        <button
          type="button"
          onClick={closeAlertModal}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 sm:p-2.5 rounded-full transition cursor-pointer z-20 shadow-xs"
          title="Minimizar en segundo plano"
          aria-label="Minimizar notificación"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Voice Agent Badge Indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-[10px] sm:text-xs font-black mb-2 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span>🎙️ {negocio.nombre || 'La Chuspa Tech'} Agente de Voz Sincronizado</span>
        </div>

        {/* ================= ETAPA 0: ASIGNANDO REPARTIDOR ================= */}
        {alertModal === 'asignando' && (
          <div className="space-y-3.5 sm:space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-3xl sm:text-4xl mx-auto shadow-inner animate-pulse">
              ⏳🛵
            </div>

            <span className="bg-amber-100 text-amber-950 font-black text-[10px] sm:text-xs uppercase px-3.5 py-1 rounded-full inline-block">
              Estado: Pedido Registrado
            </span>

            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-amber-950 leading-tight">
              ¡Estamos Asignando tu Repartidor!
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Tu solicitud para <strong>{nombreNegocio}</strong> ha sido recibida con éxito. Nuestro despachador está asignando la moto de reparto más cercana en Cusco.
            </p>

            {/* Order details card */}
            {activeCustomerOrder && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-bold text-slate-900">{activeCustomerOrder.tipoBalon}</span>
                  <strong className="text-purple-900 font-black text-sm sm:text-base">S/ {activeCustomerOrder.montoCobro}</strong>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-700 inline flex-shrink-0" />
                  <span className="truncate">{activeCustomerOrder.direccion || 'Cusco'}</span>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 flex items-center justify-between pt-1.5 border-t border-slate-200">
                  <span>Pago: <strong className="text-slate-700">{activeCustomerOrder.metodoPago}</strong></span>
                  <span>Hora: <strong className="text-slate-700">{activeCustomerOrder.hora}</strong></span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={closeAlertModal}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm md:text-base transition cursor-pointer shadow-md min-h-[44px] flex items-center justify-center gap-2"
              >
                👍 ¡Entendido, esperando asignación!
              </button>
            </div>
          </div>
        )}

        {/* ================= ETAPA 1: EN CAMINO ================= */}
        {alertModal === 'en_camino' && (
          <div className="space-y-3.5 sm:space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-3xl sm:text-4xl mx-auto shadow-inner animate-bounce">
              🛵🔥
            </div>

            <span className="bg-purple-100 text-purple-900 font-black text-[10px] sm:text-xs uppercase px-3.5 py-1 rounded-full inline-block">
              Etapa 1: En Camino (Ruta Activa)
            </span>

            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-purple-950 leading-tight">
              ¡Tu Balón está en Camino!
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-md mx-auto">
              Tu repartidor <strong>{repartidorNombre}</strong> de <strong>{nombreNegocio}</strong> ya salió de la base con tu pedido y viene en ruta directa a tu domicilio.
            </p>

            {/* Stepper Progress responsive on Celular, Tablet, PC */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 text-[9px] sm:text-[11px] md:text-xs font-black uppercase text-center">
              <div className="bg-purple-700 text-white py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl shadow-xs">
                1. En Camino ✔
              </div>
              <div className="bg-slate-100 text-slate-400 py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl">
                2. En Puerta
              </div>
              <div className="bg-slate-100 text-slate-400 py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl">
                3. Entregado
              </div>
            </div>

            {/* Order details */}
            {activeCustomerOrder && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-purple-950">
                  <span className="font-bold">{activeCustomerOrder.tipoBalon}</span>
                  <span className="font-black text-sm sm:text-base">S/ {activeCustomerOrder.montoCobro}</span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-700 inline flex-shrink-0" />
                  <span className="truncate">{activeCustomerOrder.direccion || 'Cusco'}</span>
                </div>
                <div className="text-[10px] sm:text-xs text-purple-800 font-bold pt-1.5 border-t border-purple-200">
                  ⏱️ Tiempo estimado: 10 - 15 minutos
                </div>
              </div>
            )}

            <p className="text-[11px] sm:text-xs text-slate-500">
              💡 Ten listo tu método de pago ({activeCustomerOrder?.metodoPago || 'Efectivo/Yape'}) y el balón vacío si es con canje.
            </p>

            <button
              type="button"
              onClick={closeAlertModal}
              className="w-full bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 text-white font-black py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm md:text-base transition cursor-pointer shadow-md min-h-[44px] flex items-center justify-center gap-2"
            >
              ¡Excelente, estaré atento! 🗺️
            </button>
          </div>
        )}

        {/* ================= ETAPA 2: REPARTIDOR EN PUERTA ================= */}
        {alertModal === 'en_puerta' && (
          <div className="space-y-3.5 sm:space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl sm:text-5xl mx-auto shadow-inner animate-pulse">
              🚪🦁
            </div>

            <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] sm:text-xs uppercase px-3.5 py-1 rounded-full inline-block">
              Etapa 2: Repartidor en tu Puerta
            </span>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-800 leading-tight">
              ¡Tu Repartidor ya está en la Puerta!
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-md mx-auto">
              ¡Tu repartidor <strong>{repartidorNombre}</strong> acaba de llegar a tu puerta con tu balón de gas!
            </p>

            {/* Stepper Progress */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 text-[9px] sm:text-[11px] md:text-xs font-black uppercase text-center">
              <div className="bg-purple-200 text-purple-800 py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl">
                1. En Camino
              </div>
              <div className="bg-emerald-600 text-white py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl shadow-sm animate-pulse">
                2. En Puerta ✔
              </div>
              <div className="bg-slate-100 text-slate-400 py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl">
                3. Entregado
              </div>
            </div>

            {clienteAvisoEnviado ? (
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-emerald-900 font-bold animate-in fade-in space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-700">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>¡Aviso enviado a {repartidorNombre}!</span>
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-800 font-normal">
                  Tu repartidor ya sabe que estás saliendo. Por favor abre la puerta para recibir tu gas.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-emerald-950 font-bold">
                🔔 Por favor presiona el botón para avisarle a tu repartidor que estás saliendo a recibir el balón:
              </div>
            )}

            <button
              type="button"
              onClick={handleSalirARecibir}
              className={`w-full py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm md:text-base font-black transition cursor-pointer shadow-lg flex items-center justify-center gap-2 min-h-[48px] ${
                clienteAvisoEnviado
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
              }`}
            >
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
              <span>{clienteAvisoEnviado ? '✔ ¡Aviso Enviado! (Cerrar Notificación)' : 'Salir a Recibir ✔️'}</span>
            </button>

            <div className="pt-1">
              <button
                type="button"
                onClick={closeAlertModal}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
                <span>Cerrar Notificación</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= ETAPA 3: COMPLETADO / AGRADECIMIENTO, RESEÑA GOOGLE Y REDES SOCIALES ================= */}
        {alertModal === 'completado' && (
          <div className="space-y-3.5 sm:space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-purple-200 to-yellow-200 text-purple-900 flex items-center justify-center text-4xl sm:text-5xl mx-auto shadow-inner animate-bounce">
              🦁✨
            </div>

            <span className="bg-purple-100 text-purple-900 font-black text-[10px] sm:text-xs uppercase px-3.5 py-1 rounded-full inline-block">
              Etapa 3: Entrega Exitosa
            </span>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-purple-950 leading-tight">
              ¡Muchas Gracias por tu Compra!
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-md mx-auto">
              Tu pedido ha sido entregado exitosamente por <strong>{repartidorNombre}</strong>.
            </p>

            {/* Stepper Completed */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 text-[9px] sm:text-[11px] md:text-xs font-black uppercase text-center">
              <div className="bg-purple-200 text-purple-800 py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl">
                1. En Camino ✔
              </div>
              <div className="bg-purple-200 text-purple-800 py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl">
                2. En Puerta ✔
              </div>
              <div className="bg-emerald-600 text-white py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl shadow-xs">
                3. Entregado ✔
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-purple-950 font-semibold space-y-1">
              <p className="font-bold">
                ❤️ En <strong>{nombreNegocio}</strong> te agradecemos por tu preferencia.
              </p>
              <p className="text-[11px] sm:text-xs text-purple-800">
                ¡Que disfrutes de una cocina segura y rendidora en tu hogar o negocio!
              </p>
            </div>

            {/* ================= CLUB DE FIDELIDAD • TARJETA DIGITAL DE 10 SELLOS ================= */}
            <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-amber-400 shadow-xl space-y-3.5 text-left relative overflow-hidden">
              {/* Background badge watermark */}
              <div className="absolute -right-4 -bottom-4 text-purple-800/30 text-8xl pointer-events-none select-none">
                🎁
              </div>

              {/* Title & Badge */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-amber-400 text-purple-950 flex items-center justify-center font-black text-base shadow-sm">
                    🎁
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-amber-300 leading-tight">
                      Club de Fidelidad {nombreNegocio}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-purple-200 font-semibold">
                      ¡10 sellos = 1 Regalito sorpresa o recarga bonificada!
                    </p>
                  </div>
                </div>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/50 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Tarjeta Digital
                </span>
              </div>

              {/* DNI Query Box */}
              <div className="bg-white/10 backdrop-blur-xs p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/15 space-y-2">
                <label className="text-[10px] font-bold uppercase text-purple-200 block">
                  Consulta o Sella con tu DNI:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    value={fidelidadDni}
                    onChange={(e) => {
                      setFidelidadDni(e.target.value.replace(/\D/g, ''));
                      setHasQueriedDni(false);
                      setJustStampedAlert(null);
                    }}
                    placeholder="Ingresa tu DNI (8 dígitos)"
                    className="flex-1 bg-white text-slate-900 font-bold text-xs p-2 sm:p-2.5 rounded-xl border border-purple-300 focus:outline-amber-400 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleConsultarFidelidad()}
                    className="bg-amber-400 hover:bg-amber-500 text-purple-950 font-black text-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Consultar</span>
                  </button>
                </div>

                {/* Stamping Button for Current Purchase */}
                {fidelidadDni.length === 8 && (
                  <button
                    type="button"
                    onClick={handleSellarCompra}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer animate-pulse"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-200" />
                    <span>🏷️ ¡Sellar Mi Compra de Hoy! (+1 Sello)</span>
                  </button>
                )}
              </div>

              {/* Success Notification Alert */}
              {justStampedAlert && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                  <span>{justStampedAlert}</span>
                </div>
              )}

              {/* Stamp Grid (10 Slots) */}
              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs">
                  <span className="font-extrabold text-purple-200 text-[11px] uppercase">
                    Tus Sellos Acumulados:
                  </span>
                  <span className="font-black text-amber-300 text-xs sm:text-sm">
                    {fidelidadCliente ? `${fidelidadCliente.sellos} / 10 Sellos` : '0 / 10 Sellos'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-purple-950/80 rounded-full h-2.5 mb-3 overflow-hidden border border-purple-700/50">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-yellow-300 h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, ((fidelidadCliente?.sellos || 0) / 10) * 100)}%`
                    }}
                  />
                </div>

                {/* 10 Stamps Display */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                  {[...Array(10)].map((_, i) => {
                    const slotNum = i + 1;
                    const isStamped = (fidelidadCliente?.sellos || 0) >= slotNum;
                    const isPrizeSlot = slotNum === 10;

                    return (
                      <div
                        key={slotNum}
                        className={`relative rounded-xl p-2 flex flex-col items-center justify-center transition-all aspect-square border ${
                          isStamped
                            ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-purple-950 border-amber-300 shadow-md scale-[1.02]'
                            : isPrizeSlot
                            ? 'bg-amber-400/10 border-dashed border-amber-400/60 text-amber-300 animate-pulse'
                            : 'bg-white/5 border-dashed border-white/20 text-purple-300'
                        }`}
                        title={
                          isStamped
                            ? `Sello #${slotNum} validado ✔️`
                            : isPrizeSlot
                            ? '¡Espacio #10: Regalito al completar!'
                            : `Espacio de Sello #${slotNum}`
                        }
                      >
                        <span className="text-[9px] font-black absolute top-1 left-1 opacity-75">
                          {slotNum}
                        </span>

                        <div className="text-base sm:text-lg my-auto">
                          {isStamped ? (
                            '✔️'
                          ) : isPrizeSlot ? (
                            '🎁'
                          ) : (
                            '🛢️'
                          )}
                        </div>

                        <span className="text-[7px] font-black uppercase tracking-tight block">
                          {isStamped ? 'Sellado' : isPrizeSlot ? 'Regalo' : 'Gas'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status and Claim Reward Banner */}
              {fidelidadCliente && fidelidadCliente.sellos >= 10 ? (
                <div className="bg-gradient-to-r from-amber-400 to-yellow-400 text-purple-950 rounded-xl p-3 text-center space-y-1.5 shadow-lg border border-yellow-200">
                  <div className="text-2xl animate-bounce">🎉🎁🥳</div>
                  <strong className="text-sm sm:text-base font-black block">
                    ¡FELICITACIONES, {fidelidadCliente.nombre.toUpperCase()}!
                  </strong>
                  <p className="text-[11px] sm:text-xs font-bold leading-tight">
                    Has acumulado 10 sellos oficiales. Tienes un <strong>REGALITO</strong> listo para entrega.
                  </p>
                  <a
                    href={`https://wa.me/${formatWhatsAppNumber(telefonos.whatsapp || negocio.whatsapp)}?text=${encodeURIComponent(
                      `¡Hola ${nombreNegocio}! 🎉 He completado mis 10 sellos en el Club de Fidelidad con mi DNI ${fidelidadCliente.dni} (${fidelidadCliente.nombre}). Deseo coordinar la entrega de mi regalito del club 🎁`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full bg-purple-950 hover:bg-black text-amber-300 font-black py-2.5 px-3 rounded-xl text-xs transition shadow-md cursor-pointer mt-1"
                  >
                    <Gift className="w-4 h-4 text-amber-300" />
                    <span>Reclamar mi Regalito por WhatsApp 🎁</span>
                  </a>
                </div>
              ) : fidelidadCliente ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-purple-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-purple-300 block">Titular de la tarjeta:</span>
                    <strong className="text-white text-xs block">{fidelidadCliente.nombre}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-300 block font-bold">
                      Faltan {10 - fidelidadCliente.sellos} sellos
                    </span>
                    <span className="text-[10px] text-purple-300">
                      Total consumos: {fidelidadCliente.totalConsumos}
                    </span>
                  </div>
                </div>
              ) : hasQueriedDni ? (
                <div className="bg-purple-900/60 border border-purple-700/60 rounded-xl p-2.5 text-xs text-purple-200 text-center">
                  <span>DNI no registrado aún en el Club. Haz clic en <strong>"Sellar Mi Compra de Hoy"</strong> para abrir tu tarjeta digital gratis.</span>
                </div>
              ) : null}
            </div>

            {/* SECCIÓN GOOGLE MAPS REVIEW (RESEÑA 5 ESTRELLAS) */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-yellow-400 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 space-y-2 text-center shadow-xs">
              <div className="flex justify-center items-center gap-1.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <p className="text-xs sm:text-sm font-black text-amber-950 leading-tight">
                ¿Qué te pareció nuestro servicio de gas hoy?
              </p>
              <p className="text-[10px] sm:text-xs text-amber-800">
                Tu calificación nos ayuda a seguir brindando la entrega más rápida de Cusco.
              </p>
              <a
                href={negocio.googleReviewUrl || 'https://www.lachuspaanuncios.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 transition shadow-sm min-h-[44px]"
              >
                <Star className="w-4 h-4 fill-white text-white flex-shrink-0" />
                <span>⭐⭐⭐⭐⭐ Calificar en Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-100 flex-shrink-0" />
              </a>
            </div>

            {/* REDES SOCIALES DEL NEGOCIO - Responsive: 2 cols on mobile, 4 cols on tablet/PC */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2.5">
              <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 block">
                ¡Síguenos en Nuestras Redes Oficiales!
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {/* Facebook */}
                <a
                  href={negocio.facebookUrl || 'https://facebook.com/lachuspaanuncios'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition min-h-[54px]"
                >
                  <span className="text-lg">📘</span>
                  <span className="truncate w-full text-center">Facebook</span>
                </a>

                {/* Instagram */}
                <a
                  href={negocio.instagramUrl || 'https://instagram.com/lachuspaanuncios'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition min-h-[54px]"
                >
                  <span className="text-lg">📷</span>
                  <span className="truncate w-full text-center">Instagram</span>
                </a>

                {/* TikTok */}
                <a
                  href={negocio.tiktokUrl || 'https://tiktok.com/@lachuspaanuncios'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition min-h-[54px]"
                >
                  <span className="text-lg">🎵</span>
                  <span className="truncate w-full text-center">TikTok</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${formatWhatsAppNumber(negocio.whatsapp || telefonos.whatsapp)}?text=${encodeURIComponent(
                    `Hola ${nombreNegocio}, acabo de recibir mi pedido de gas con éxito. ¡Muchas gracias!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition min-h-[54px]"
                >
                  <span className="text-lg">💬</span>
                  <span className="truncate w-full text-center">WhatsApp</span>
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
                className="w-full bg-slate-100 hover:bg-slate-200 text-purple-950 font-bold py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer border border-slate-200 min-h-[44px]"
              >
                <FileText className="w-4 h-4 text-purple-700 flex-shrink-0" />
                <span>Ver Comprobante Digital (Boleta / Factura)</span>
              </button>
            )}

            <button
              type="button"
              onClick={closeAlertModal}
              className="w-full bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 text-white font-black py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm md:text-base transition cursor-pointer shadow-md min-h-[44px]"
            >
              ¡Muchas Gracias! ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
