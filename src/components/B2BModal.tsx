import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Building2, Search, Send, Plus, Minus } from 'lucide-react';

interface B2BModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const B2BModal: React.FC<B2BModalProps> = ({ isOpen, onClose }) => {
  const { empresasB2B, addEmpresaB2B, createPedido, telefonos } = useApp();

  const [ruc, setRuc] = useState<string>('');
  const [razonSocial, setRazonSocial] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [precio45, setPrecio45] = useState<number>(175.0);
  const [condicionPago, setCondicionPago] = useState<string>('Crédito (A cuenta 15 días)');
  const [cantidad45, setCantidad45] = useState<number>(2);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleLookupRUC = async () => {
    const cleanRuc = ruc.trim();
    if (cleanRuc.length !== 11) {
      alert('Ingresa un RUC válido de 11 dígitos.');
      return;
    }

    // Check if already in B2B portfolio
    const existing = empresasB2B.find((e) => e.ruc === cleanRuc);
    if (existing) {
      setRazonSocial(existing.razonSocial);
      setPrecio45(existing.precioBalon45);
      setCondicionPago(existing.condicionPago);
      if (existing.direccion) setDireccion(existing.direccion);
      if (existing.telefono) setTelefono(existing.telefono);
      alert(`✔ Empresa registrada en cartera: ${existing.razonSocial} (Tarifa S/ ${existing.precioBalon45})`);
      return;
    }

    // Otherwise lookup in SUNAT API
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.apis.net.pe/v2/sunat/ruc?numero=${cleanRuc}`, {
        headers: {
          Authorization:
            'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImVkd2lub2JsaXRhc3ViYWxkZUBnbWFpbC5jb20iLCJqdGkiOiIxNzExZGRjNTc5M2ZhYjQ0In0.h1PcqQHzHBK6abr7ZGVkMeSTOSN49BWOWHzB7wpIDw8',
          Accept: 'application/json'
        }
      });
      if (!res.ok) throw new Error('Error en padrón SUNAT');
      const data = await res.json();
      if (data && data.razonSocial) {
        setRazonSocial(data.razonSocial);
        if (data.direccion) setDireccion(data.direccion);
        alert(`✔ RUC verificado en SUNAT: ${data.razonSocial}`);
      } else {
        throw new Error('No encontrado');
      }
    } catch {
      const manual = prompt('RUC válido. Ingresa la Razón Social de la empresa:');
      if (manual) setRazonSocial(manual.trim());
    } finally {
      setIsSearching(false);
    }
  };

  const totalB2B = cantidad45 * precio45;

  const handleSubmitB2B = () => {
    if (!ruc || ruc.trim().length !== 11) {
      alert('Por favor ingresa un RUC válido de 11 dígitos.');
      return;
    }
    const empresaNombre = razonSocial.trim() || `Empresa RUC ${ruc}`;

    // Save to B2B portfolio
    addEmpresaB2B({
      ruc: ruc.trim(),
      razonSocial: empresaNombre,
      precioBalon45: precio45,
      condicionPago,
      direccion: direccion.trim(),
      telefono: telefono.trim()
    });

    // Create system order
    createPedido({
      tipoVenta: 'mayorista_b2b',
      cliente: empresaNombre,
      tipoBalon: `${cantidad45}x Balón LeoGas 45kg Industrial (B2B)`,
      montoCobro: totalB2B.toFixed(2),
      metodoPago: condicionPago,
      tipoComprobante: `Factura Electrónica (RUC: ${ruc})`,
      direccion: direccion || 'Cusco (B2B)'
    });

    // WhatsApp format
    let msg = `*🏢 ¡PEDIDO B2B / EMPRESAS - LEOGAS CUSCO!*\n\n`;
    msg += `*🏢 Empresa:* ${empresaNombre}\n`;
    msg += `*📄 RUC:* ${ruc}\n`;
    msg += `*🛢️ Detalle:* ${cantidad45} Balones de 45kg Industrial\n`;
    msg += `*💵 Tarifa Pactada:* S/ ${precio45.toFixed(2)} c/u\n`;
    msg += `*💰 Total:* S/ ${totalB2B.toFixed(2)}\n`;
    msg += `*📋 Condición de Pago:* ${condicionPago}\n`;
    msg += `*📍 Dirección de Despacho:* ${direccion || 'Coordinar con planta'}\n`;
    if (telefono) msg += `*📞 Contacto:* ${telefono}\n`;
    msg += `\n_Despacho prioritario comercial LeoGas Cusco (Llamagas)._`;

    const targetUrl = `https://wa.me/${telefonos.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(targetUrl, '_blank');

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-yellow-300 p-4 flex items-center justify-between border-b-2 border-yellow-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="font-black text-base leading-tight text-white">
                Portal Corporativo B2B / Restaurantes
              </h3>
              <p className="text-[11px] text-yellow-400 font-bold">
                Atención especial para pollerías, chifas, panaderías y hoteles
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* RUC & Search */}
          <div>
            <label className="font-extrabold text-slate-600 uppercase text-[10px] block mb-1">
              RUC de la Empresa (11 dígitos):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={11}
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
                placeholder="Ej: 20601234567"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-sm text-slate-800"
              />
              <button
                type="button"
                onClick={handleLookupRUC}
                disabled={isSearching}
                className="bg-purple-800 hover:bg-purple-900 text-white font-bold px-4 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Validar</span>
              </button>
            </div>
          </div>

          {/* Razón Social */}
          <div>
            <label className="font-extrabold text-slate-600 uppercase text-[10px] block mb-1">
              Razón Social / Nombre Comercial:
            </label>
            <input
              type="text"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              placeholder="Ej: Pollería El Tablón Wanchaq"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs text-slate-800"
            />
          </div>

          {/* Quantity Balón 45kg */}
          <div className="bg-yellow-50 border border-yellow-300 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="font-black text-slate-900 text-sm block">
                Balón LeoGas 45kg Industrial
              </span>
              <span className="text-[11px] text-amber-800 font-bold">
                Tarifa corporativa pactada: S/ {precio45.toFixed(2)} c/u
              </span>
            </div>

            <div className="flex items-center bg-white border border-yellow-400 rounded-xl overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setCantidad45((prev) => Math.max(1, prev - 1))}
                className="w-8 h-8 flex items-center justify-center hover:bg-yellow-100 font-bold cursor-pointer text-slate-800"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-9 text-center font-black text-sm text-purple-900">
                {cantidad45}
              </span>
              <button
                type="button"
                onClick={() => setCantidad45((prev) => prev + 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-yellow-100 font-bold cursor-pointer text-slate-800"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <label className="font-extrabold text-slate-600 uppercase text-[10px] block mb-1">
              Condición de Crédito / Pago:
            </label>
            <select
              value={condicionPago}
              onChange={(e) => setCondicionPago(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs text-slate-800 cursor-pointer"
            >
              <option value="Crédito (A cuenta 15 días)">📋 Crédito a 15 Días (Quincenal)</option>
              <option value="Crédito (A cuenta 30 días)">📋 Crédito a 30 Días (Mensual)</option>
              <option value="Factura al Contado">💵 Factura al Contado contra entrega</option>
            </select>
          </div>

          {/* Address & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="font-extrabold text-slate-600 uppercase text-[10px] block mb-1">
                Dirección del Local:
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Av. El Sol 450"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-600 uppercase text-[10px] block mb-1">
                Teléfono de Contacto:
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="984 000 000"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Total Orden B2B:
            </span>
            <span className="text-xl font-black text-purple-900">
              S/ {totalB2B.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmitB2B}
            className="bg-slate-900 hover:bg-slate-800 text-yellow-400 font-extrabold text-xs py-3 px-5 rounded-xl flex items-center gap-2 transition shadow-md cursor-pointer border border-yellow-500"
          >
            <Send className="w-4 h-4 text-yellow-400" />
            <span>Enviar Pedido Mayorista</span>
          </button>
        </div>
      </div>
    </div>
  );
};
