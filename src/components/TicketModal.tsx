import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, MessageCircle, X } from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose }) => {
  const { activeCustomerOrder, carrito, cartTotal, negocio, telefonos } = useApp();

  if (!isOpen) return null;

  // Use active order data if exists, otherwise current cart
  const clienteNombre = activeCustomerOrder?.cliente || 'Particular';
  const total = activeCustomerOrder
    ? typeof activeCustomerOrder.montoCobro === 'number'
      ? activeCustomerOrder.montoCobro
      : parseFloat(activeCustomerOrder.montoCobro) || 0
    : cartTotal;

  const subtotal = total / 1.18;
  const igv = total - subtotal;
  const metodoPago = activeCustomerOrder?.metodoPago || 'Efectivo';
  const serie = activeCustomerOrder?.tipoComprobante?.includes('Factura')
    ? 'F001-000124'
    : 'B001-000452';
  const isFactura = activeCustomerOrder?.tipoComprobante?.includes('Factura');

  const fechaHora = activeCustomerOrder?.hora
    ? `${activeCustomerOrder.fecha || 'Hoy'} - ${activeCustomerOrder.hora}`
    : new Date().toLocaleString('es-PE');

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    let msg = `*${(negocio.nombre || 'LA CHUSPA TECH').toUpperCase()} - COMPROBANTE ELECTRÓNICO*\n`;
    msg += `Serie: ${serie}\n`;
    msg += `Cliente: ${clienteNombre}\n`;
    msg += `Total Pagado: S/ ${total.toFixed(2)}\n`;
    msg += `Forma de Pago: ${metodoPago}\n`;
    msg += `¡Gracias por su preferencia con ${negocio.nombre || 'La Chuspa Tech'}!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
      <div className="w-full max-w-[94vw] xs:max-w-sm sm:max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 font-mono text-xs text-slate-800 printable-area my-auto max-h-[88dvh] sm:max-h-[86vh] overflow-y-auto overscroll-contain">
        {/* Printable Ticket Box */}
        <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
          <div className="flex justify-center mb-1.5">
            <img
              src={negocio.logoUrl || '/CHUSPITA-circulo.png'}
              alt={negocio.nombre}
              className="w-10 h-10 rounded-full object-cover border border-amber-400 bg-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/CHUSPITA-circulo.png';
              }}
            />
          </div>
          <h2 className="font-black text-sm tracking-widest text-purple-950 uppercase">
            {negocio.nombre || 'LA CHUSPA TECH'}
          </h2>
          <p className="text-[10px] text-slate-600 font-bold uppercase">
            {negocio.slogan || 'PUBLICIDAD, TECNOLOGÍA & GAS'}
          </p>
          <p className="text-[10px] text-slate-500">R.U.C. N° 20601894521</p>
          <p className="text-[10px] text-slate-500">
            {negocio.direccion || 'Cusco - Perú'}
          </p>
          <p className="text-[10px] text-slate-500">Central / WhatsApp: {telefonos.whatsapp || '969773064'}</p>

          <div className="mt-2 py-1 bg-slate-100 rounded text-[11px] font-black tracking-wider text-purple-900">
            *** {isFactura ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA'} ***
          </div>
          <div className="text-[11px] font-bold mt-0.5 text-slate-700">{serie}</div>
        </div>

        {/* Customer & Date */}
        <div className="border-b border-dashed border-slate-300 pb-2 mb-2 space-y-0.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">FECHA:</span>
            <span className="font-bold">{fechaHora}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">CLIENTE:</span>
            <span className="font-bold truncate max-w-[190px]">{clienteNombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">PAGO:</span>
            <span className="font-bold">{metodoPago}</span>
          </div>
        </div>

        {/* Items */}
        <div className="border-b border-dashed border-slate-300 pb-2 mb-2">
          <div className="flex justify-between font-bold text-[10px] text-slate-400 border-b border-slate-200 pb-1 mb-1">
            <span>CANT. DESCRIPCIÓN</span>
            <span>TOTAL</span>
          </div>

          {activeCustomerOrder ? (
            <div className="flex justify-between text-[11px] py-0.5">
              <span className="truncate pr-2">{activeCustomerOrder.tipoBalon}</span>
              <span className="font-bold">S/ {total.toFixed(2)}</span>
            </div>
          ) : (
            Object.values(carrito).map((it) => (
              <div key={it.id} className="flex justify-between text-[11px] py-0.5">
                <span className="truncate pr-2">
                  {it.cantidad}x {it.nombre}
                </span>
                <span className="font-bold">S/ {(it.precio * it.cantidad).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="space-y-1 text-right text-[11px] border-b border-dashed border-slate-300 pb-2 mb-3">
          <div className="flex justify-between">
            <span className="text-slate-500">OP. GRAVADA:</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">I.G.V. (18%):</span>
            <span>S/ {igv.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-black text-purple-900 border-t border-slate-300 pt-1">
            <span>TOTAL A PAGAR:</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer OSE */}
        <div className="text-center text-[9px] text-slate-400 leading-tight mb-4">
          Autorizado mediante Resolución de Superintendencia SUNAT<br />
          Representación impresa del Comprobante Electrónico<br />
          <strong>¡Gracias por su preferencia con {negocio.nombre || 'La Chuspa Tech'}!</strong>
        </div>

        {/* Non-print Buttons */}
        <div className="flex gap-2 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold p-2 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
