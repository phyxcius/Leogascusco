import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  MapPin,
  FileText,
  MessageCircle,
  Banknote,
  Smartphone,
  CreditCard,
  Search,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { formatWhatsAppNumber } from '../utils/assets';
import { playSuccessChime, playChimeSound } from '../utils/audio';
import { consultarDni, consultarRuc } from '../utils/apisPeru';
import { DraftReceiptData } from './TicketModal';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTicket: (draft?: DraftReceiptData) => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onOpenTicket }) => {
  const {
    carrito,
    updateCartQty,
    clearCart,
    cartTotal,
    createPedido,
    telefonos,
    negocio
  } = useApp();

  const allowBoleta = negocio.habilitarBoletaDni !== false;
  const allowFactura = negocio.habilitarFacturaRuc !== false;
  const comprobantesHabilitados = allowBoleta || allowFactura;

  const [metodoPago, setMetodoPago] = useState<string>('Efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState<string>('');
  const [horarioEntrega, setHorarioEntrega] = useState<'Inmediata' | 'Programada'>('Inmediata');
  const [tipoComprobante, setTipoComprobante] = useState<'Boleta' | 'Factura'>(
    allowBoleta ? 'Boleta' : 'Factura'
  );

  const [nombreCliente, setNombreCliente] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');
  const [dniBoleta, setDniBoleta] = useState<string>('');
  const [rucFactura, setRucFactura] = useState<string>('');
  const [razonSocial, setRazonSocial] = useState<string>('');

  // Official RENIEC / SUNAT verified states
  const [dniVerified, setDniVerified] = useState<{ dni: string; nombre: string } | null>(null);
  const [rucVerified, setRucVerified] = useState<{
    ruc: string;
    razonSocial: string;
    estado?: string;
    condicion?: string;
  } | null>(null);
  const [docFeedback, setDocFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearchingDoc, setIsSearchingDoc] = useState<boolean>(false);
  const [showResendPrompt, setShowResendPrompt] = useState<boolean>(false);
  const [lastSentMinutes, setLastSentMinutes] = useState<number>(0);

  // Sync tipoComprobante if admin toggles Boleta/Factura availability
  useEffect(() => {
    if (allowBoleta && !allowFactura) {
      setTipoComprobante('Boleta');
    } else if (!allowBoleta && allowFactura) {
      setTipoComprobante('Factura');
    }
  }, [allowBoleta, allowFactura]);

  if (!isOpen) return null;

  const items = Object.values(carrito);

  // Fast Cash calculations
  const pagaConNum = parseFloat(montoEfectivo) || 0;
  const vueltoCalculado = pagaConNum > 0 ? pagaConNum - cartTotal : null;

  const handleQuickCash = (val: number | 'exacto') => {
    if (val === 'exacto') {
      setMontoEfectivo(cartTotal.toFixed(2));
    } else {
      setMontoEfectivo(val.toString());
    }
  };

  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada en este navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        playSuccessChime();
      },
      () => {
        alert('No se pudo acceder al GPS. Verifica los permisos de ubicación en tu navegador.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchDNI = async (): Promise<{ dni: string; nombre: string } | null> => {
    const dni = dniBoleta.trim().replace(/\D/g, '');
    if (dni.length !== 8) {
      setDocFeedback({ ok: false, msg: 'Ingresa un DNI válido de 8 dígitos numéricos.' });
      playChimeSound();
      return null;
    }
    setIsSearchingDoc(true);
    setDocFeedback(null);
    try {
      const res = await consultarDni(dni);
      if (res.success && res.nombreCompleto) {
        const verifiedObj = { dni, nombre: res.nombreCompleto };
        setDniVerified(verifiedObj);
        setNombreCliente(res.nombreCompleto);
        setDocFeedback({
          ok: true,
          msg: `✔ Verificado en RENIEC: ${res.nombreCompleto}`
        });
        playSuccessChime();
        return verifiedObj;
      } else {
        setDniVerified(null);
        setDocFeedback({
          ok: false,
          msg: res.error || 'DNI no encontrado en el padrón de RENIEC.'
        });
        playChimeSound();
        return null;
      }
    } catch {
      setDniVerified(null);
      setDocFeedback({
        ok: false,
        msg: 'No se pudo conectar con RENIEC para validar el DNI.'
      });
      return null;
    } finally {
      setIsSearchingDoc(false);
    }
  };

  const handleSearchRUC = async (): Promise<{ ruc: string; razonSocial: string; estado?: string; condicion?: string } | null> => {
    const ruc = rucFactura.trim().replace(/\D/g, '');
    if (ruc.length !== 11) {
      setDocFeedback({ ok: false, msg: 'Ingresa un RUC válido de 11 dígitos numéricos.' });
      playChimeSound();
      return null;
    }
    setIsSearchingDoc(true);
    setDocFeedback(null);
    try {
      const res = await consultarRuc(ruc);
      if (res.success && res.razonSocial) {
        const verifiedObj = {
          ruc,
          razonSocial: res.razonSocial,
          estado: res.estado,
          condicion: res.condicion
        };
        setRucVerified(verifiedObj);
        setRazonSocial(res.razonSocial);
        setNombreCliente(res.razonSocial);
        if (res.direccion && !direccion) {
          setDireccion(res.direccion);
        }
        setDocFeedback({
          ok: true,
          msg: `✔ RUC Verificado SUNAT (${res.estado || 'ACTIVO'} • ${res.condicion || 'HABIDO'})`
        });
        playSuccessChime();
        return verifiedObj;
      } else {
        setRucVerified(null);
        setDocFeedback({
          ok: false,
          msg: res.error || 'RUC no encontrado en el padrón de SUNAT.'
        });
        playChimeSound();
        return null;
      }
    } catch {
      setRucVerified(null);
      setDocFeedback({
        ok: false,
        msg: 'No se pudo conectar con SUNAT para validar el RUC.'
      });
      return null;
    } finally {
      setIsSearchingDoc(false);
    }
  };

  // Validate RENIEC / SUNAT strictly before opening or printing Boleta / Factura
  const handleOpenVerifiedTicket = async () => {
    if (items.length === 0) {
      alert('Tu carrito está vacío. Agrega al menos un balón de gas para ver el comprobante.');
      return;
    }

    if (!comprobantesHabilitados) {
      onOpenTicket({
        tipo: 'Nota',
        cliente: nombreCliente.trim() || 'Cliente Doméstico',
        direccion: direccion.trim() || 'Cusco',
        metodoPago,
        validado: false
      });
      return;
    }

    if (tipoComprobante === 'Factura') {
      const cleanRuc = rucFactura.trim().replace(/\D/g, '');
      if (cleanRuc.length !== 11) {
        setDocFeedback({
          ok: false,
          msg: 'Para imprimir Factura Electrónica debes ingresar un RUC de 11 dígitos y validarlo en SUNAT.'
        });
        alert('⚠️ Para emitir o imprimir Factura Electrónica, ingresa un RUC válido de 11 dígitos y valídalo con SUNAT.');
        return;
      }

      let verified = rucVerified && rucVerified.ruc === cleanRuc ? rucVerified : null;
      if (!verified) {
        verified = await handleSearchRUC();
      }
      if (!verified) {
        alert('⚠️ No se puede imprimir Factura sin validar el RUC en el padrón oficial de SUNAT.');
        return;
      }

      onOpenTicket({
        tipo: 'Factura',
        documento: verified.ruc,
        tipoDoc: 'RUC',
        cliente: verified.razonSocial,
        direccion: direccion.trim() || 'Cusco',
        metodoPago,
        validado: true,
        estadoContribuyente: `${verified.estado || 'ACTIVO'} - ${verified.condicion || 'HABIDO'}`
      });
      return;
    }

    // Boleta Electrónica requires DNI verified in RENIEC
    const cleanDni = dniBoleta.trim().replace(/\D/g, '');
    if (cleanDni.length !== 8) {
      setDocFeedback({
        ok: false,
        msg: 'Para imprimir Boleta Electrónica debes ingresar un DNI de 8 dígitos y validarlo en RENIEC.'
      });
      alert('⚠️ Para emitir o imprimir Boleta Electrónica, ingresa un DNI válido de 8 dígitos y valídalo con RENIEC.');
      return;
    }

    let verified = dniVerified && dniVerified.dni === cleanDni ? dniVerified : null;
    if (!verified) {
      verified = await handleSearchDNI();
    }
    if (!verified) {
      alert('⚠️ No se puede imprimir Boleta sin verificar el DNI en RENIEC (no se permiten nombres ficticios).');
      return;
    }

    onOpenTicket({
      tipo: 'Boleta',
      documento: verified.dni,
      tipoDoc: 'DNI',
      cliente: verified.nombre,
      direccion: direccion.trim() || 'Cusco',
      metodoPago,
      validado: true,
      estadoContribuyente: 'DNI VÁLIDO RENIEC'
    });
  };

  const executeOrderSubmission = () => {
    const clienteName =
      comprobantesHabilitados && tipoComprobante === 'Factura' && rucVerified
        ? rucVerified.razonSocial
        : comprobantesHabilitados && tipoComprobante === 'Boleta' && dniVerified
          ? dniVerified.nombre
          : nombreCliente.trim() || 'Particular';

    const detalleProductos = items.map(i => `${i.cantidad}x ${i.nombre}`).join(', ');
    const comprobanteDetalle = !comprobantesHabilitados
      ? `Nota de Pedido (${clienteName})`
      : tipoComprobante === 'Factura'
        ? `Factura (RUC: ${rucFactura} - ${razonSocial || clienteName})`
        : `Boleta (DNI: ${dniBoleta || 'Sin DNI'} - ${clienteName})`;

    const gpsUrl = gpsCoords
      ? `https://www.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}`
      : direccion.trim() || 'Cusco (A coordinar)';

    // Register order in AppContext state
    createPedido({
      cliente: clienteName,
      tipoBalon: detalleProductos,
      montoCobro: cartTotal.toFixed(2),
      metodoPago:
        metodoPago === 'Efectivo' && vueltoCalculado !== null && vueltoCalculado >= 0
          ? `Efectivo (Paga con S/ ${pagaConNum.toFixed(2)} - Vuelto S/ ${vueltoCalculado.toFixed(2)})`
          : metodoPago,
      tipoComprobante: comprobanteDetalle,
      direccion: direccion || 'Cusco',
      gpsUrl: gpsCoords ? `https://www.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}` : '',
      lat: gpsCoords?.lat,
      lng: gpsCoords?.lng
    });

    // Save submission log to localStorage for double-submission detection
    try {
      localStorage.setItem(
        'leogas_last_order_sent_info',
        JSON.stringify({
          time: Date.now(),
          cliente: clienteName,
          total: cartTotal.toFixed(2),
          detalle: detalleProductos
        })
      );
    } catch (e) {
      console.warn('Storage log error:', e);
    }

    // Generate WhatsApp Text
    let msg = `*🚀 ¡HOLA ${(negocio.nombre || 'LA CHUSPA TECH').toUpperCase()}! DESEO HACER UN PEDIDO:*\n\n`;
    msg += `*👤 Cliente:* ${clienteName}\n`;
    msg += `*🛢️ Detalle:* ${detalleProductos}\n`;
    msg += `*💰 Total a Pagar:* S/ ${cartTotal.toFixed(2)}\n`;
    msg += `*💵 Método de Pago:* ${metodoPago}\n`;
    if (metodoPago === 'Efectivo' && vueltoCalculado !== null && vueltoCalculado >= 0) {
      msg += `*💵 Paga con:* S/ ${pagaConNum.toFixed(2)} (Vuelto: S/ ${vueltoCalculado.toFixed(2)})\n`;
    }
    msg += `*⏰ Horario:* ${horarioEntrega}\n`;
    if (comprobantesHabilitados) {
      msg += `*🧾 Comprobante:* ${comprobanteDetalle}\n`;
    }
    msg += `*📍 Dirección / GPS:* ${gpsUrl}\n\n`;
    msg += `_Pedido registrado en el sistema ${negocio.nombre || 'La Chuspa Tech'}._`;

    const targetNumber = formatWhatsAppNumber(telefonos.whatsapp || negocio.whatsapp);
    const targetUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(msg)}`;
    window.open(targetUrl, '_blank');

    // RESET CART TO ZERO
    clearCart();
    setShowResendPrompt(false);
    onClose();
  };

  const handleSubmitOrderWhatsApp = () => {
    if (items.length === 0) {
      alert('Tu carrito está vacío. Agrega al menos un balón de gas.');
      return;
    }

    // Check if the user already sent an order recently (e.g., within 15 minutes)
    try {
      const stored = localStorage.getItem('leogas_last_order_sent_info');
      if (stored) {
        const parsed = JSON.parse(stored);
        const diffMs = Date.now() - (parsed.time || 0);
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 15) {
          setLastSentMinutes(diffMins);
          setShowResendPrompt(true);
          return;
        }
      }
    } catch {
      // ignore
    }

    executeOrderSubmission();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Re-send confirmation prompt modal */}
      {showResendPrompt && (
        <div className="fixed inset-0 z-[3000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white max-w-[94vw] xs:max-w-sm w-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-amber-400 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
              ⚠️
            </div>
            <h4 className="font-black text-base text-slate-900 mb-1">
              Tu pedido ya fue enviado anteriormente
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Registramos que ya enviaste un pedido por WhatsApp hace {lastSentMinutes === 0 ? 'unos momentos' : `${lastSentMinutes} minuto(s)`}. 
              <br /><br />
              <strong>¿Deseas enviar por segunda vez este pedido?</strong>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResendPrompt(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                No, Cancelar
              </button>
              <button
                type="button"
                onClick={() => executeOrderSubmission()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                Sí, Enviar por 2da vez
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-purple-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={negocio.logoUrl || '/CHUSPITA-circulo.png'}
              alt={negocio.nombre}
              className="w-8 h-8 rounded-full object-cover bg-white p-0.5"
            />
            <div>
              <h3 className="font-black text-base leading-tight">Mi Pedido {negocio.nombre || 'La Chuspa Tech'}</h3>
              <p className="text-[11px] text-yellow-300 font-bold">
                {negocio.slogan || 'Entrega rápida a domicilio en Cusco'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Cart Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-extrabold uppercase text-slate-500 text-[10px]">
                Productos Seleccionados
              </span>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Vaciar</span>
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-400">
                Tu carrito está vacío. Elige balones o accesorios del catálogo.
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-xl"
                  >
                    <div className="min-w-0 pr-2">
                      <strong className="text-slate-800 text-xs block truncate">{it.nombre}</strong>
                      <span className="text-slate-500 text-[11px]">S/ {it.precio.toFixed(2)} c/u</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateCartQty(it.id, -1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-extrabold text-xs text-purple-900">
                          {it.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(it.id, 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-black text-purple-900 text-xs w-16 text-right">
                        S/ {(it.precio * it.cantidad).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
            <span className="font-extrabold uppercase text-slate-500 text-[10px] block mb-2">
              Forma de Pago
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'Efectivo', icon: Banknote },
                { id: 'Yape', icon: Smartphone },
                { id: 'Plin', icon: Smartphone },
                { id: 'Tarjeta', icon: CreditCard }
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetodoPago(m.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition cursor-pointer border ${
                      metodoPago === m.id
                        ? 'bg-purple-800 text-white border-purple-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.id}</span>
                  </button>
                );
              })}
            </div>

            {/* Fast Cash Drawer */}
            {metodoPago === 'Efectivo' && (
              <div className="mt-3 p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                <label className="text-[11px] font-bold text-purple-900 block">
                  ¿Con cuánto dinero pagarás en efectivo?
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={montoEfectivo}
                  onChange={(e) => setMontoEfectivo(e.target.value)}
                  placeholder="Ej: 100"
                  className="w-full bg-white border border-purple-300 rounded-lg p-2 font-black text-sm text-purple-900 focus:outline-purple-600"
                />

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickCash('exacto')}
                    className="bg-white hover:bg-purple-100 border border-purple-300 text-purple-900 text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer"
                  >
                    Monto Exacto (S/ {cartTotal.toFixed(2)})
                  </button>
                  {[50, 100, 200].map((billete) => (
                    <button
                      key={billete}
                      type="button"
                      onClick={() => handleQuickCash(billete)}
                      className="bg-white hover:bg-purple-100 border border-purple-300 text-purple-900 text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer"
                    >
                      Billete S/ {billete}
                    </button>
                  ))}
                </div>

                {vueltoCalculado !== null && (
                  <div
                    className={`p-2 rounded-lg text-xs font-bold flex justify-between items-center ${
                      vueltoCalculado < 0
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    <span>{vueltoCalculado < 0 ? '⚠️ Monto insuficiente:' : '💵 Vuelto a entregar:'}</span>
                    <strong className="text-sm">
                      {vueltoCalculado < 0
                        ? `Faltan S/ ${Math.abs(vueltoCalculado).toFixed(2)}`
                        : `S/ ${vueltoCalculado.toFixed(2)}`}
                    </strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delivery Schedule */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
            <span className="font-extrabold uppercase text-slate-500 text-[10px] block mb-2">
              Horario de Entrega
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHorarioEntrega('Inmediata')}
                className={`py-2 px-3 rounded-xl font-bold transition text-xs cursor-pointer border ${
                  horarioEntrega === 'Inmediata'
                    ? 'bg-purple-800 text-white border-purple-800'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                ⚡ Inmediata (15-30 min)
              </button>
              <button
                type="button"
                onClick={() => setHorarioEntrega('Programada')}
                className={`py-2 px-3 rounded-xl font-bold transition text-xs cursor-pointer border ${
                  horarioEntrega === 'Programada'
                    ? 'bg-purple-800 text-white border-purple-800'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                📅 Programada (Para hoy)
              </button>
            </div>
          </div>

          {/* Invoice / Comprobante OR Simple Domestic Client Box */}
          {comprobantesHabilitados ? (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-extrabold uppercase text-slate-500 text-[10px]">
                  Comprobante de Pago (Validación Oficial)
                </span>
                <div className="inline-flex bg-slate-200 p-0.5 rounded-lg">
                  {allowBoleta && (
                    <button
                      type="button"
                      onClick={() => {
                        setTipoComprobante('Boleta');
                        setDocFeedback(null);
                      }}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                        tipoComprobante === 'Boleta' ? 'bg-purple-800 text-white' : 'text-slate-600'
                      }`}
                    >
                      Boleta
                    </button>
                  )}
                  {allowFactura && (
                    <button
                      type="button"
                      onClick={() => {
                        setTipoComprobante('Factura');
                        setDocFeedback(null);
                      }}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                        tipoComprobante === 'Factura' ? 'bg-purple-800 text-white' : 'text-slate-600'
                      }`}
                    >
                      Factura
                    </button>
                  )}
                </div>
              </div>

              {tipoComprobante === 'Boleta' && allowBoleta ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={8}
                      value={dniBoleta}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setDniBoleta(val);
                        if (dniVerified && dniVerified.dni !== val) {
                          setDniVerified(null);
                          setDocFeedback(null);
                        }
                      }}
                      placeholder="DNI del cliente (8 dígitos RENIEC)"
                      className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleSearchDNI}
                      disabled={isSearchingDoc}
                      className="bg-purple-800 hover:bg-purple-900 disabled:opacity-60 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{isSearchingDoc ? '...' : 'Validar'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={11}
                      value={rucFactura}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setRucFactura(val);
                        if (rucVerified && rucVerified.ruc !== val) {
                          setRucVerified(null);
                          setDocFeedback(null);
                        }
                      }}
                      placeholder="RUC de empresa (11 dígitos SUNAT)"
                      className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleSearchRUC}
                      disabled={isSearchingDoc}
                      className="bg-purple-800 hover:bg-purple-900 disabled:opacity-60 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{isSearchingDoc ? '...' : 'SUNAT'}</span>
                    </button>
                  </div>
                  {razonSocial && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg font-bold text-xs">
                      Razón Social: {razonSocial}
                    </div>
                  )}
                </div>
              )}

              {docFeedback && (
                <div
                  className={`p-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border ${
                    docFeedback.ok
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-red-50 border-red-300 text-red-700'
                  }`}
                >
                  {docFeedback.ok ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{docFeedback.msg}</span>
                </div>
              )}

              <div>
                <input
                  type="text"
                  value={nombreCliente}
                  onChange={(e) => {
                    setNombreCliente(e.target.value);
                    // Clear official verification if name is manually overwritten for Boleta/Factura
                    if (dniVerified && e.target.value !== dniVerified.nombre) setDniVerified(null);
                    if (rucVerified && e.target.value !== rucVerified.razonSocial) setRucVerified(null);
                  }}
                  placeholder={
                    tipoComprobante === 'Factura'
                      ? 'Razón social validada ante SUNAT'
                      : 'Nombre completo (validado con DNI o para entrega)'
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {tipoComprobante === 'Factura'
                    ? 'Para imprimir Factura Electrónica es obligatorio validar RUC en SUNAT.'
                    : 'Para imprimir Boleta Electrónica es obligatorio validar DNI de 8 dígitos en RENIEC.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2">
              <span className="font-extrabold uppercase text-slate-500 text-[10px] block">
                Datos del Cliente (Pedido Doméstico)
              </span>
              <input
                type="text"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                placeholder="Tu nombre o referencia (Ej: Sra. María)"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
              />
            </div>
          )}

          {/* Address & GPS */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2">
            <span className="font-extrabold uppercase text-slate-500 text-[10px] block">
              Dirección de Entrega en Cusco
            </span>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Av. De la Cultura 720, Wanchaq (o referencia)"
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
            />

            <button
              type="button"
              onClick={handleCaptureGPS}
              className={`w-full font-black py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
                gpsCoords
                  ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white border-2 border-emerald-300 shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-400/40 animate-pulse'
                  : 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 shadow-2xs'
              }`}
            >
              <MapPin className={`w-4 h-4 ${gpsCoords ? 'text-yellow-200 animate-bounce' : 'text-purple-700'}`} />
              <span className="text-xs sm:text-sm font-black tracking-wide">
                {gpsCoords
                  ? `✔ 📍 UBICACIÓN GPS ACTIVA (${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)})`
                  : '📍 Adjuntar mi Ubicación GPS en Vivo'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer / Checkout */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-bold text-xs">Total a Pagar:</span>
            <span className="text-2xl font-black text-purple-900">
              S/ {cartTotal.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleOpenVerifiedTicket}
              disabled={isSearchingDoc}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 px-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              title={
                comprobantesHabilitados
                  ? 'Validar con RENIEC/SUNAT y ver Boleta o Factura'
                  : 'Ver Nota de Pedido'
              }
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">
                {comprobantesHabilitados ? 'Comprobante' : 'Nota'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleSubmitOrderWhatsApp}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Enviar Pedido por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
