import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Building2, Bell, Truck, ShieldCheck, User, ExternalLink } from 'lucide-react';
import { playChimeSound } from '../utils/audio';
import { getAssetUrl, getPageUrl } from '../utils/assets';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenB2B: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenB2B }) => {
  const { activePortal, setActivePortal, cartCount } = useApp();
  const [showWindowMenu, setShowWindowMenu] = React.useState(false);

  const handleNotificationClick = () => {
    playChimeSound();
    if ('Notification' in window) {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          new Notification('🦁 LeoGas Cusco', {
            body: '¡Alertas sonoras y notificaciones activadas con éxito!'
          });
        }
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Group */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePortal('cliente')}
            className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-700 text-amber-400 flex items-center justify-center font-black text-2xl shadow-md">
              🦁
            </div>
            <div>
              <h1 className="text-lg font-black leading-tight text-purple-900 tracking-wide">
                LeoGas Cusco
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                Llamagas • El Moradito Rendidor
              </p>
            </div>
          </button>

          {/* La Chuspa Tech Badge */}
          <a
            href="https://lachuspaanuncios.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 bg-yellow-50 border border-yellow-400 py-1 px-2.5 rounded-full text-xs hover:bg-yellow-100 transition shadow-xs"
            title="Desarrollado con La Chuspa Tech"
          >
            <img
              src={getAssetUrl('CHUSPITA-circulo.png')}
              alt="La Chuspa"
              className="w-6 h-6 rounded-full object-cover border border-amber-600 bg-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://lachuspaanuncios.com/wp-content/uploads/2023/10/cropped-logo-la-chuspa.png';
              }}
            />
            <div className="flex flex-col text-[10px] leading-tight">
              <span className="font-extrabold text-purple-900">La Chuspa Tech</span>
              <span className="text-amber-700 font-semibold">by La Chuspa Anuncios</span>
            </div>
          </a>
        </div>

        {/* Portal Switcher & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Portal Switcher Tabs */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActivePortal('cliente')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activePortal === 'cliente'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Cliente</span>
            </button>
            <button
              onClick={() => setActivePortal('repartidor')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activePortal === 'repartidor'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-800'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Repartidor</span>
            </button>
            <button
              onClick={() => setActivePortal('admin')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activePortal === 'admin'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Open Independent Window Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowWindowMenu(!showWindowMenu)}
              className="bg-amber-100 hover:bg-amber-200 text-purple-950 border border-amber-300 px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition cursor-pointer shadow-xs"
              title="Abrir en ventana o pestaña independiente"
            >
              <ExternalLink className="w-3.5 h-3.5 text-purple-900" />
              <span className="hidden sm:inline">Ventanas</span>
            </button>

            {showWindowMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in"
                onMouseLeave={() => setShowWindowMenu(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-black uppercase text-slate-400 border-b border-slate-100">
                  Abrir Ventana Separada ↗
                </div>
                <a
                  href={getPageUrl('index.html')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-900 transition"
                  onClick={() => setShowWindowMenu(false)}
                >
                  <User className="w-4 h-4 text-purple-700" />
                  <span>Ventana Cliente (index.html)</span>
                </a>
                <a
                  href={getPageUrl('repartidor.html')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-900 transition"
                  onClick={() => setShowWindowMenu(false)}
                >
                  <Truck className="w-4 h-4 text-purple-700" />
                  <span>Ventana Repartidor (repartidor.html)</span>
                </a>
                <a
                  href={getPageUrl('admin.html')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-900 transition"
                  onClick={() => setShowWindowMenu(false)}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>Ventana Admin (admin.html)</span>
                </a>
              </div>
            )}
          </div>

          {activePortal === 'cliente' && (
            <>
              {/* B2B Modal Trigger */}
              <button
                type="button"
                onClick={onOpenB2B}
                className="bg-slate-900 text-yellow-300 border border-yellow-500 hover:bg-slate-800 px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5 text-yellow-400" />
                <span className="hidden md:inline">Empresas /</span> B2B
              </button>

              {/* Sound/Alert Notifications button */}
              <button
                type="button"
                onClick={handleNotificationClick}
                className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 p-2 rounded-full text-xs font-bold flex items-center justify-center transition cursor-pointer"
                title="Probar Alertas Sonoras"
              >
                <Bell className="w-4 h-4 text-purple-700" />
              </button>

              {/* Cart Button */}
              <button
                type="button"
                onClick={onOpenCart}
                className="bg-purple-800 hover:bg-purple-900 text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span>Pedir Gas</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
