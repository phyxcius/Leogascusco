import React, { useState } from 'react';
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
  Search
} from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTicket: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onOpenTicket }) => {
  const {
    carrito,
    updateCartQty,
    clearCart,
    cartTotal,
    createPedido,
    telefonos
  } = useApp();

  const [metodoPago, setMetodoPago] = useState<string>('Efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState<string>('');
  const [horarioEntrega, setHorarioEntrega] = useState<'Inmediata' | 'Programada'>('Inmediata');
  const [tipoComprobante, setTipoComprobante] = useState<'Boleta' | 'Factura'>('Boleta');

  const [nombreCliente, setNombreCliente] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');
  const [dniBoleta, setDniBoleta] = useState<string>('');
  const [rucFactura, setRucFactura] = useState<string>('');
  const [razonSocial, setRazonSocial] = useState<string>('');

  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearchingDoc, setIsSearchingDoc] = useState<boolean>(false);

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
        alert('✔ Ubicación GPS capturada exitosamente');
      },
      () => {
        alert('No se pudo acceder al GPS.');
      }
    );
  };

  const handleSearchDNI = async () => {
    const dni = dniBoleta.trim();
    if (dni.length !== 8) {
      alert('Ingresa un DNI válido de 8 dígitos.');
      return;
    }
    setIsSearchingDoc(true);
    try {
      const res = await fetch(`https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`, {
        headers: {
          Authorization:
            'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImVkd2lub2JsaXRhc3ViYWxkZUBnbWFpbC5jb20iLCJqdGkiOiIxNzExZGRjNTc5M2ZhYjQ0In0.h1PcqQHzHBK6abr7ZGVkMeSTOSN49BWOWHzB7wpIDw8',
          Accept: 'application/json'
        }
      });
      if (!res.ok) throw new Error('Error en consulta');
      const data = await res.json();
      if (data && data.nombres) {
        const full = `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`;
        setNombreCliente(full);
        alert(`✔ DNI Encontrado: ${full}`);
      } else {
        throw new Error('No encontrado');
      }
    } catch {
      const manual = prompt('No se pudo conectar al padrón en línea. Ingresa el nombre del cliente manualmente:');
      if (manual) setNombreCliente(manual.trim());
    } finally {
      setIsSearchingDoc(false);
    }
  };

  const handleSearchRUC = async () => {
    const ruc = rucFactura.trim();
    if (ruc.length !== 11) {
      alert('Ingresa un RUC válido de 11 dígitos.');
      return;
    }
    setIsSearchingDoc(true);
    try {
      const res = await fetch(`https://api.apis.net.pe/v2/sunat/ruc?numero=${ruc}`, {
        headers: {
          Authorization:
            'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImVkd2lub2JsaXRhc3ViYWxkZUBnbWFpbC5jb20iLCJqdGkiOiIxNzExZGRjNTc5M2ZhYjQ0In0.h1PcqQHzHBK6abr7ZGVkMeSTOSN49BWOWHzB7wpIDw8',
          Accept: 'application/json'
        }
      });
      if (!res.ok) throw new Error('Error en consulta');
      const data = await res.json();
      if (data && data.razonSocial) {
        setRazonSocial(data.razonSocial);
        setNombreCliente(data.razonSocial);
        if (data.direccion) setDireccion(data.direccion);
        alert(`✔ RUC Encontrado: ${data.razonSocial}`);
      } else {
        throw new Error('No encontrado');
      }
    } catch {
      const manual = prompt('No se pudo conectar a SUNAT. Ingresa la Razón Social manualmente:');
      if (manual) {
        setRazonSocial(manual.trim());
        setNombreCliente(manual.trim());
      }
    } finally {
      setIsSearchingDoc(false);
    }
  };

  const handleSubmitOrderWhatsApp = () => {
    if (items.length === 0) {
      alert('Tu carrito está vacío. Agrega al menos un balón de gas.');
      return;
    }

    const clienteName = nombreCliente.trim() || 'Particular';
    const detalleProductos = items.map(i => `${i.cantidad}x ${i.nombre}`).join(', ');
    const comprobanteDetalle =
      tipoComprobante === 'Factura'
        ? `Factura (RUC: ${rucFactura} - ${razonSocial})`
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

    // Generate WhatsApp Text
    let msg = `*🦁 ¡HOLA LEOGAS CUSCO! DESEO HACER UN PEDIDO:*\n\n`;
    msg += `*👤 Cliente:* ${clienteName}\n`;
    msg += `*🛢️ Detalle:* ${detalleProductos}\n`;
    msg += `*💰 Total a Pagar:* S/ ${cartTotal.toFixed(2)}\n`;
    msg += `*💵 Método de Pago:* ${metodoPago}\n`;
    if (metodoPago === 'Efectivo' && vueltoCalculado !== null && vueltoCalculado >= 0) {
      msg += `*💵 Paga con:* S/ ${pagaConNum.toFixed(2)} (Vuelto: S/ ${vueltoCalculado.toFixed(2)})\n`;
    }
    msg += `*⏰ Horario:* ${horarioEntrega}\n`;
    msg += `*🧾 Comprobante:* ${comprobanteDetalle}\n`;
    msg += `*📍 Dirección / GPS:* ${gpsUrl}\n\n`;
    msg += `_Pedido registrado en el sistema LeoGas Cusco (Llamagas)._`;

    const targetUrl = `https://wa.me/${telefonos.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(targetUrl, '_blank');

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-purple-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦁</span>
            <div>
              <h3 className="font-black text-base leading-tight">Mi Pedido LeoGas Cusco</h3>
              <p className="text-[11px] text-yellow-300 font-bold">
                Entrega rápida a domicilio en Cusco
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

          {/* Invoice / Comprobante */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-extrabold uppercase text-slate-500 text-[10px]">
                Comprobante de Pago
              </span>
              <div className="inline-flex bg-slate-200 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTipoComprobante('Boleta')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                    tipoComprobante === 'Boleta' ? 'bg-purple-800 text-white' : 'text-slate-600'
                  }`}
                >
                  Boleta
                </button>
                <button
                  type="button"
                  onClick={() => setTipoComprobante('Factura')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                    tipoComprobante === 'Factura' ? 'bg-purple-800 text-white' : 'text-slate-600'
                  }`}
                >
                  Factura
                </button>
              </div>
            </div>

            {tipoComprobante === 'Boleta' ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    value={dniBoleta}
                    onChange={(e) => setDniBoleta(e.target.value)}
                    placeholder="DNI del cliente (8 dígitos)"
                    className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleSearchDNI}
                    disabled={isSearchingDoc}
                    className="bg-purple-800 hover:bg-purple-900 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Validar</span>
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
                    onChange={(e) => setRucFactura(e.target.value)}
                    placeholder="RUC de empresa (11 dígitos)"
                    className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleSearchRUC}
                    disabled={isSearchingDoc}
                    className="bg-purple-800 hover:bg-purple-900 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>SUNAT</span>
                  </button>
                </div>
                {razonSocial && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg font-bold text-xs">
                    Razón Social: {razonSocial}
                  </div>
                )}
              </div>
            )}

            <div>
              <input
                type="text"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                placeholder="Nombre completo / Razón social"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
              />
            </div>
          </div>

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
              className="w-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-purple-700" />
              <span>
                {gpsCoords
                  ? `✔ GPS Registrado (${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)})`
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
              onClick={onOpenTicket}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Ver Boleta / Factura Térmica"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Comprobante</span>
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
